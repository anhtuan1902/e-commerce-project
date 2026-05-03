import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { getSearchSuggestions } from '@/features/products/api/product.api';
import { useDebounce } from '../../utils/useDebounce';
import { useProductsStore } from '@/features/products/store/products.store';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

const SearchBar = ({ placeholder = 'Tìm kiếm...', onSearch }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: number; name: string; price: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const setSelectedCategoryId = useProductsStore((s) => s.setSelectedCategoryId);

  const debouncedQuery = useDebounce(input, 600);

  // Abort in-flight request on unmount
  useEffect(() => {
    return () => setShowDropdown(false);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (
        !dropdownRef.current?.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // Fetch suggestions after debounce
  useEffect(() => {
    const query = debouncedQuery.trim();
    if (!query) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setShowDropdown(true);

    getSearchSuggestions(query)
      .then((results) => { if (!cancelled) setSuggestions(results); })
      .catch(() => { if (!cancelled) { setSuggestions([]); setError('Không thể tải gợi ý'); } })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleSubmit = () => {
    const query = input.trim();
    setShowDropdown(false);
    setSuggestions([]);
    onSearch?.(query);
    setSelectedCategoryId(null);
  };

  const selectSuggestion = (product: { name: string }) => {
    setInput(product.name);
    setShowDropdown(false);
    setSuggestions([]);
    onSearch?.(product.name);
    setSelectedCategoryId(null);
  };

  const clearInput = () => {
    setInput('');
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = suggestions[highlightedIndex];
      selected ? selectSuggestion(selected) : handleSubmit();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const isEmptyState = !isLoading && !error && input.trim().length > 0 && suggestions.length === 0;

  return (
    <div className='hidden sm:flex flex-1 max-w-xs sm:max-w-sm md:max-w-xl mx-2 sm:mx-4 md:mx-8'>
      <div className='relative w-full'>
        {/* Input */}
        <div className='relative flex items-center'>
          <input
            ref={inputRef}
            type='text'
            value={input}
            placeholder={placeholder}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (input.trim()) setShowDropdown(true); }}
            className='w-full pl-8 sm:pl-10 pr-10 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent'
          />
          {isLoading ? (
            <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin' />
          ) : input ? (
            <button onClick={clearInput} type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
              <X className='h-4 w-4' />
            </button>
          ) : null}
          <Search className='absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400 dark:text-gray-500 pointer-events-none' />
        </div>

        {/* Search button */}
        <button
          onClick={handleSubmit}
          type='button'
          className='absolute right-0 top-0 h-full px-3 sm:px-4 rounded-r-full bg-[#1E3A8A] hover:bg-indigo-700 dark:bg-[#1E3A8A] dark:hover:bg-indigo-500 flex items-center justify-center'
        >
          <Search className='h-4 sm:h-5 w-4 sm:w-5 text-white' />
        </button>

        {/* Suggestions Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden'
          >
            {/* Results */}
            {suggestions.length > 0 && (
              <ul>
                {suggestions.map((product, i) => (
                  <li key={product.id}>
                    <button
                      onClick={() => selectSuggestion(product)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                        i === highlightedIndex
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Search className='h-3.5 w-3.5 text-gray-400 shrink-0' />
                      <span className='truncate'>{product.name}</span>
                      <span className='ml-auto text-xs text-gray-500 dark:text-gray-400 shrink-0'>
                        ₫{Number(product.price).toLocaleString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Empty state */}
            {isEmptyState && (
              <div className='px-4 py-6 text-center'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Không tìm thấy kết quả cho <strong className='text-gray-700 dark:text-gray-200'>&quot;{input}&quot;</strong>
                </p>
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                  Nhấn Enter để tìm kiếm hoặc thử cụm từ khác
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className='px-4 py-3 text-sm text-red-500 dark:text-red-400 text-center'>
                {error}
              </div>
            )}

            {/* Footer hint */}
            {suggestions.length > 0 && (
              <div className='border-t border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center justify-between'>
                <span className='text-xs text-gray-400 dark:text-gray-500'>
                  Nhấn <kbd className='px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'>↑↓</kbd> để chọn, <kbd className='px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'>Enter</kbd> để tìm
                </span>
                <span className='text-xs text-gray-400 dark:text-gray-400'>{suggestions.length} gợi ý</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
