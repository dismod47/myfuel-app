from src.validate_position import validate_position_decorator


def _fib_impl(position, recursive_func):
    """
    Core Fibonacci logic: F(n) = F(n-1) + F(n-2), with F(0) = F(1) = 1

    This helper function implements the Fibonacci recurrence relation,
    delegating recursive calls to the provided recursive_func.
    This allows both plain and memoized versions to share the same logic (DRY).

    Args:
        position: The Fibonacci position to calculate
        recursive_func: The function to call recursively (either fib_recursive or fib_memoized)

    Returns:
        The Fibonacci number at the given position
    """
    if position in (0, 1):
        return 1
    return recursive_func(position - 1) + recursive_func(position - 2)


@validate_position_decorator
def fib_recursive(position):
    """
    Plain recursive Fibonacci implementation - O(2^n) time complexity.

    This uses exponential recursion with no memoization, making it slow for large positions.
    Each call branches into two more calls, creating an exponential call tree.

    Args:
        position: The Fibonacci position to calculate (must be non-negative)

    Returns:
        The Fibonacci number at the given position

    Raises:
        ValueError: If position is negative
    """
    return _fib_impl(position, fib_recursive)
