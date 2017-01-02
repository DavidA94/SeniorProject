using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace SecurityService
{
    public class Encryption
    {
        private static string secret = "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.";

        public static string Encrypt(string data)
        {
            byte[] clearBytes = Encoding.ASCII.GetBytes(data);

            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(secret, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });

                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);

                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(clearBytes, 0, clearBytes.Length);
                        cs.Close();
                    }

                    data = Convert.ToBase64String(ms.ToArray());
                }
            }

            return data;
        }

        public static string Decrypt(string data)
        {
            byte[] cipherBytes = Convert.FromBase64String(data);

            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(secret, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });

                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);

                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(cipherBytes, 0, cipherBytes.Length);
                        cs.Close();
                    }

                    data = Encoding.ASCII.GetString(ms.ToArray());

                }

            }

            return data;
        }

        public static byte[] ComputeHash(string input, byte[] saltBytes)
        {
            var inputBytes = Encoding.UTF8.GetBytes(input);

            // Combine salt and input bytes
            var saltedInput = new byte[saltBytes.Length + inputBytes.Length];
            saltBytes.CopyTo(saltedInput, 0);
            inputBytes.CopyTo(saltedInput, saltBytes.Length);

            return (new SHA256CryptoServiceProvider()).ComputeHash(saltedInput);
        }

        public static byte[] GetRandomBytes(int length)
        {
            var randomBytes = new byte[length];
            using (var random = new RNGCryptoServiceProvider())
            {
                random.GetNonZeroBytes(randomBytes);
            }

            return randomBytes;
        }
    }
}