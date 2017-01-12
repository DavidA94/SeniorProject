using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Database.CustomValidators
{
    class VINAttribute : ValidationAttribute
    {
        public override bool IsValid(object value)
        {
            // Ensure we're not null and we're on a string
            if (value == null || !(value is string)) return false;

            // Setup return value and string version of value
            bool isValid = true;
            string vin = (value as string).ToUpper();

            // Need to be 17 characters long to be a valid VIN
            if (vin.Length != 17) return false;

            // Set up the character values and the position weights
            var alphaNum = new Dictionary<char, int> {
                { 'A', 1 }, { 'B', 2 }, { 'C', 3 }, { 'D', 4 }, { 'E', 5 }, { 'F', 6 }, { 'G', 7 }, 
                { 'H', 8 }, { 'I', 9 }, { 'J', 1 }, { 'K', 2 }, { 'L', 3 }, { 'M', 4 }, { 'N', 5 }, 
                { 'O', 6 }, { 'P', 7 }, { 'Q', 8 }, { 'R', 9 }, { 'S', 2 }, { 'T', 3 }, { 'U', 4 }, 
                { 'V', 5 }, { 'W', 6 }, { 'X', 7 }, { 'Y', 8 }, { 'Z', 9 }, { '0', 0 }, { '1', 1 }, 
                { '2', 2 }, { '3', 3 }, { '4', 4 }, { '5', 5 }, { '6', 6 }, { '7', 7 }, { '8', 8 }, { '9', 9}
            };
            var posWeight = new int[] { 8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2 };
            int vinProduct = 0;

            // Loop through and figure out the value of the VIN
            for(int i = 0; i < vin.Length; ++i)
            {
                int letterVal = (int)vin[i];
                int weight = posWeight[i];

                vinProduct += letterVal * weight;
            }

            // The check sum should be 0-10 (where 10 = X), so mod what we got by 11
            int checkSum = vinProduct % 11;

            // The 8th character is the check sum location -- Make sure it's the right number, or X
            if (checkSum == 10) isValid = vin[8] == 'X';
            else isValid = vin[8] == Convert.ToChar(checkSum + '0');

            return isValid;
        }
    }
}
