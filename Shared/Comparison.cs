using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shared
{
    public class Comparison
    {
        /// <summary>
        /// Checks if two strings are equal, where empty/null/whitespace strings are all considered the same
        /// </summary>
        /// <param name="lhs">The LHS</param>
        /// <param name="rhs">The RHS</param>
        /// <returns></returns>
        public static bool AreEqual(string lhs, string rhs)
        {
            if (string.IsNullOrWhiteSpace(lhs)) return string.IsNullOrWhiteSpace(rhs);

            return string.Equals(lhs, rhs);
        }
    }
}
