const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id',
      },
    },
    sender_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nội dung tin nhắn không được để trống' },
        len: { args: [1, 2000], msg: 'Nội dung tin nhắn không được vượt quá 2000 ký tự' },
      },
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system'),
      defaultValue: 'text',
      allowNull: false,
    },
    attachment_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: { msg: 'URL đính kèm không hợp lệ' },
      },
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'messages',
    timestamps: true,
    indexes: [
      { fields: ['conversation_id'] },
      { fields: ['sender_id'] },
      { fields: ['message_type'] },
      { fields: ['is_read'] },
      { fields: ['createdAt'] },
    ],
  },
);

// Methods
Message.prototype.markAsRead = async function () {
  if (!this.is_read) {
    this.is_read = true;
    this.read_at = new Date();
    await this.save();
  }
  return this;
};

Message.associate = (models) => {
  Message.belongsTo(models.Conversation, {
    foreignKey: 'conversation_id',
    as: 'conversation',
    onDelete: 'CASCADE',
  });
  Message.belongsTo(models.User, {
    foreignKey: 'sender_id',
    as: 'sender',
    onDelete: 'CASCADE',
  });
};

module.exports = Message;
