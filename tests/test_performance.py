import unittest
import time

from src.fib_recursive import fib_recursive
from src.fib_memoized_recursive import fib_memoized


class PerformanceTest(unittest.TestCase):
    """Test that memoized version is significantly faster than plain recursion."""

    def test_memoized_recursive_faster_than_simple_recursion(self):
        """
        Verify that fib_memoized is at least 10x faster than fib_recursive.

        For position=30:
        - fib_recursive makes ~2.7 million recursive calls (2^30)
        - fib_memoized makes only 30 unique calls (linear)

        Expected speedup: 100x to 1000x or more
        """

        def time_counter(func, position):
            start = time.perf_counter()
            result = func(position)
            elapsed = time.perf_counter() - start
            return elapsed, result

        # Use position 30 for a clear performance difference
        # (position 35 would be even more dramatic but takes longer)
        test_position = 30

        # Time the memoized version
        memo_time, memo_result = time_counter(fib_memoized, test_position)

        # Time the plain recursive version
        recursive_time, recursive_result = time_counter(fib_recursive, test_position)

        # Verify they produce the same result
        self.assertEqual(memo_result, recursive_result,
                         "Both implementations should produce the same result")

        # Verify memoized is at least 10x faster
        self.assertLessEqual(memo_time * 10, recursive_time,
                             f"Memoized ({memo_time:.6f}s) should be at least 10x faster "
                             f"than recursive ({recursive_time:.6f}s)")

        # Print the speedup for informational purposes
        speedup = recursive_time / memo_time if memo_time > 0 else float('inf')
        print(f"\nPerformance results for position {test_position}:")
        print(f"  Memoized:  {memo_time:.6f}s")
        print(f"  Recursive: {recursive_time:.6f}s")
        print(f"  Speedup:   {speedup:.1f}x")

    def test_both_produce_correct_results(self):
        """Verify both implementations produce correct Fibonacci numbers."""
        # First few Fibonacci numbers: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55
        expected = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]

        for position, expected_value in enumerate(expected):
            with self.subTest(position=position):
                self.assertEqual(fib_recursive(position), expected_value)
                self.assertEqual(fib_memoized(position), expected_value)

    def test_validation_works_for_both(self):
        """Verify both implementations reject negative positions."""
        with self.assertRaises(ValueError) as context:
            fib_recursive(-1)
        self.assertIn("non-negative", str(context.exception))

        with self.assertRaises(ValueError) as context:
            fib_memoized(-1)
        self.assertIn("non-negative", str(context.exception))


if __name__ == '__main__':
    unittest.main(verbosity=2)
