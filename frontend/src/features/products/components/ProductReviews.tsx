import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Send, Lock, ThumbsUp, MessageCircle, Reply } from 'lucide-react';
import StarRating from './StarRating';
import { useAuthStore } from '../../../store/auth.store';
import toast from 'react-hot-toast';
import type { ProductComment } from '../types/product.type';

export interface Review {
    id: number;
    customer_name: string;
    rating: number;
    date: string;
    comment: string;
    is_verified?: boolean;
    title?: string;
    helpful_count?: number;
    reply?: string;
}

export type Comment = ProductComment;

interface ProductReviewsProps {
    reviews: Review[];
    comments?: Comment[];
    averageRating: number;
    totalRatings: number;
    totalComments?: number;
    productId: number;
    onReviewSubmitted?: () => void;
    onCommentSubmitted?: () => void;
}

const InteractiveStarRating = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (rating: number) => void;
}) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    <Star
                        className={`h-7 w-7 transition-colors ${
                            star <= (hover || value)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

const ReviewForm = ({
    productId,
    onSuccess,
}: {
    productId: number;
    onSuccess?: () => void;
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = useAuthStore((s) => s.user);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (comment.trim().length < 10) {
            toast.error('Đánh giá phải có ít nhất 10 ký tự');
            return;
        }

        setIsSubmitting(true);
        try {
            const { createProductReview } = await import('../api/review.api');
            await createProductReview({
                product_id: productId,
                rating,
                comment: comment.trim(),
            });

            toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
            setRating(0);
            setComment('');
            onSuccess?.();
        } catch {
            toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Viết đánh giá của bạn</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá của bạn
                </label>
                <InteractiveStarRating value={rating} onChange={setRating} />
                {rating > 0 && (
                    <p className="text-sm text-amber-600 mt-1">
                        {rating === 5 && 'Tuyệt vời!'}
                        {rating === 4 && 'Rất tốt'}
                        {rating === 3 && 'Bình thường'}
                        {rating === 2 && 'Không hài lòng'}
                        {rating === 1 && 'Rất tệ'}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét của bạn
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent resize-none"
                    rows={4}
                    maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/1000 ký tự</p>
            </div>

            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    Đăng nhập với: <span className="font-medium">{user?.profile?.name || user?.email}</span>
                </p>
                <button
                    type="submit"
                    disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                    className="flex items-center gap-2 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1E3A8A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang gửi...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            Gửi đánh giá
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

const LoginPrompt = ({ onLoginClick }: { onLoginClick: () => void }) => (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
                <Lock className="h-6 w-6 text-[#1E3A8A]" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                    Đăng nhập để đánh giá sản phẩm
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Hãy chia sẻ trải nghiệm của bạn để giúp người mua khác có quyết định tốt hơn
                </p>
                <button
                    onClick={onLoginClick}
                    className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1E3A8A]/90 transition-colors"
                >
                    Đăng nhập ngay
                </button>
            </div>
        </div>
    </div>
);

const CommentItem = ({
    comment,
    onReply,
}: {
    comment: Comment;
    onReply: (commentId: number) => void;
}) => (
    <div className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
        <div className="flex gap-3">
            <div className="h-10 w-10 bg-linear-to-br from-[#1E3A8A] to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                {comment.user?.profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                        {comment.user?.profile?.name || 'Người dùng'}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1E3A8A] transition-colors">
                        <ThumbsUp className="h-3 w-3" />
                        Hữu ích ({comment.helpful_count || 0})
                    </button>
                    <button
                        onClick={() => onReply(comment.id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1E3A8A] transition-colors"
                    >
                        <Reply className="h-3 w-3" />
                        Trả lời
                    </button>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
                        {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold shrink-0">
                                    {reply.user?.profile?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-xs text-gray-900">
                                            {reply.user?.profile?.name || 'Người dùng'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{reply.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);

const CommentSection = ({
    productId,
    comments = [],
    onSuccess,
}: {
    productId: number;
    comments: Comment[];
    onSuccess?: () => void;
}) => {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = useAuthStore((s) => s.user);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newComment.trim().length < 5) {
            toast.error('Bình luận phải có ít nhất 5 ký tự');
            return;
        }

        setIsSubmitting(true);
        try {
            const api = await import('@/shared/services/axios.config').then(m => m.default);
            await api.post('/comments', {
                product_id: productId,
                content: newComment.trim(),
            });

            toast.success('Bình luận đã được thêm!');
            setNewComment('');
            onSuccess?.();
        } catch {
            toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitReply = async (parentId: number) => {
        if (replyContent.trim().length < 5) {
            toast.error('Trả lời phải có ít nhất 5 ký tự');
            return;
        }

        setIsSubmitting(true);
        try {
            const api = await import('@/shared/services/axios.config').then(m => m.default);
            await api.post('/comments', {
                product_id: productId,
                content: replyContent.trim(),
                parent_id: parentId,
            });

            toast.success('Đã trả lời bình luận!');
            setReplyContent('');
            setReplyingTo(null);
            onSuccess?.();
        } catch {
            toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent resize-none"
                    rows={3}
                    maxLength={2000}
                />
                <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-gray-400">
                        Đăng nhập với: <span className="font-medium">{user?.profile?.name || user?.email}</span>
                    </p>
                    <button
                        type="submit"
                        disabled={isSubmitting || newComment.trim().length < 5}
                        className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#1E3A8A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Bình luận
                    </button>
                </div>
            </form>

            {/* Reply Form */}
            {replyingTo && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800 mb-2">Đang trả lời bình luận...</p>
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Viết câu trả lời..."
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent resize-none"
                        rows={2}
                        maxLength={2000}
                        autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                            }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={() => handleSubmitReply(replyingTo)}
                            disabled={isSubmitting || replyContent.trim().length < 5}
                            className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#1E3A8A]/90 transition-colors disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                            Gửi trả lời
                        </button>
                    </div>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">Chưa có bình luận nào</p>
                        <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên bình luận!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={(id) => setReplyingTo(id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const ProductReviews = ({
    reviews,
    comments = [],
    averageRating,
    totalRatings,
    totalComments = 0,
    productId,
    onReviewSubmitted,
    onCommentSubmitted,
}: ProductReviewsProps) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'reviews' | 'comments'>('reviews');

    const handleLoginClick = () => {
        navigate('/login', { state: { from: location } });
    };

    const handleReviewSuccess = () => {
        onReviewSubmitted?.();
    };

    const handleCommentSuccess = () => {
        onCommentSubmitted?.();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${
                        activeTab === 'reviews'
                            ? 'text-[#1E3A8A]'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Đánh giá ({totalRatings.toLocaleString()})
                    {activeTab === 'reviews' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${
                        activeTab === 'comments'
                            ? 'text-[#1E3A8A]'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Bình luận ({totalComments.toLocaleString()})
                    {activeTab === 'comments' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A]" />
                    )}
                </button>
            </div>

            {activeTab === 'reviews' ? (
                <>
                    {/* Rating Summary */}
                    <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-xl flex flex-col md:flex-row items-center gap-8 mb-8">
                        <div className="text-center items-center md:border-r border-indigo-200 md:pr-8">
                            <div className="text-3xl font-extrabold text-[#1E3A8A] mb-1">
                                {averageRating.toFixed(1)} trên 5
                            </div>
                            <StarRating rating={averageRating} size="lg" />
                            <p className="text-sm text-gray-500 mt-2">
                                {totalRatings.toLocaleString()} đánh giá
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 flex-1">
                            <button className="border border-[#1E3A8A] text-[#1E3A8A] bg-white px-4 py-1.5 rounded-sm text-sm font-medium">
                                Tất Cả
                            </button>
                            {[5, 4, 3, 2, 1].map((star) => (
                                <button
                                    key={star}
                                    className="border border-gray-200 bg-white px-4 py-1.5 rounded-sm text-sm hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                                >
                                    {star} Sao
                                </button>
                            ))}
                            <button className="border border-gray-200 bg-white px-4 py-1.5 rounded-sm text-sm hover:border-[#1E3A8A] hover:text-[#1E3A8A]">
                                Có Hình Ảnh
                            </button>
                        </div>
                    </div>

                    {/* Review Form */}
                    <div className="mb-8">
                        {isAuthenticated ? (
                            <ReviewForm productId={productId} onSuccess={handleReviewSuccess} />
                        ) : (
                            <LoginPrompt onLoginClick={handleLoginClick} />
                        )}
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6 divide-y divide-gray-100">
                        {reviews.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này</p>
                                <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên đánh giá!</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="pt-6 flex gap-4">
                                    <div className="h-10 w-10 bg-linear-to-br from-[#1E3A8A] to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                        {review.customer_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-gray-900">
                                                {review.customer_name}
                                            </span>
                                            {review.is_verified && (
                                                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                    Đã mua hàng
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 mb-2">
                                            <div className="flex text-amber-500">
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <span className="text-xs text-gray-400">{review.date}</span>
                                        </div>
                                        {review.title && (
                                            <p className="font-medium text-sm text-gray-900 mb-1">{review.title}</p>
                                        )}
                                        <p className="text-sm text-gray-800 leading-relaxed mb-3">
                                            {review.comment}
                                        </p>
                                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1E3A8A] transition-colors">
                                            <ThumbsUp className="h-3 w-3" />
                                            Hữu ích ({review.helpful_count || 0})
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Comments Section */}
                    <CommentSection
                        productId={productId}
                        comments={comments}
                        onSuccess={handleCommentSuccess}
                    />
                </>
            )}
        </div>
    );
};

export default ProductReviews;
