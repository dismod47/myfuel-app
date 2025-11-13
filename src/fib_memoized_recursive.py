from src.validate_position import validate_position_decorator
from src.fib_recursive import _fib_impl


# Module-level cache for memoization
# This persists across calls, making subsequent calls with the same position instant
_memo_cache = {}


@validate_position_decorator
def fib_memoized(position):
    """
    Memoized recursive Fibonacci implementation - O(n) time complexity.

    This uses the same core logic as fib_recursive but caches computed values.
    Each unique position is calculated only once, making it dramatically faster
    for large positions (thousands of times faster than plain recursion).

    The cache persists across calls for maximum performance.

    Args:
        position: The Fibonacci position to calculate (must be non-negative)

    Returns:
        The Fibonacci number at the given position

    Raises:
        ValueError: If position is negative
    """
    if position not in _memo_cache:
        # Use the shared _fib_impl, but pass fib_memoized as the recursive function
        # This ensures all recursive calls go through the memoization layer
        _memo_cache[position] = _fib_impl(position, fib_memoized)

    return _memo_cache[position]
