const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Conversation = sequelize.define(
  'Conversation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('direct', 'support', 'order_inquiry', 'general'),
      defaultValue: 'general',
      allowNull: false,
    },
    reference_type: {
      type: DataTypes.ENUM('order', 'product', 'vendor', 'general'),
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'archived'),
      defaultValue: 'active',
      allowNull: false,
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'conversations',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['reference_type', 'reference_id'] },
      { fields: ['last_message_at'] },
    ],
  },
);

// Methods
Conversation.prototype.sendMessage = async function (
  senderId,
  content,
  messageType = 'text',
  attachmentUrl = null,
) {
  const message = await sequelize.models.Message.create({
    conversation_id: this.id,
    sender_id: senderId,
    content: content,
    message_type: messageType,
    attachment_url: attachmentUrl,
  });

  this.last_message_at = new Date();
  await this.save();

  return message;
};

Conversation.prototype.close = async function () {
  this.status = 'closed';
  await this.save();
  return this;
};

Conversation.prototype.archive = async function () {
  this.status = 'archived';
  await this.save();
  return this;
};

Conversation.prototype.getMessages = async function (limit = 50, offset = 0) {
  return await sequelize.models.Message.findAll({
    where: { conversation_id: this.id },
    include: [
      {
        model: sequelize.models.User,
        as: 'sender',
        attributes: ['id', 'name', 'avatar'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: limit,
    offset: offset,
  });
};

Conversation.prototype.markMessagesAsRead = async function (userId) {
  await sequelize.models.Message.update(
    { is_read: true, read_at: new Date() },
    {
      where: {
        conversation_id: this.id,
        sender_id: { [sequelize.Sequelize.Op.ne]: userId },
        is_read: false,
      },
    },
  );
  return this;
};

Conversation.associate = (models) => {
  Conversation.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });
  Conversation.hasMany(models.Message, {
    foreignKey: 'conversation_id',
    as: 'messages',
  });
};

module.exports = Conversation;
