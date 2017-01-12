using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared
{
    public static class Logger
    {
        #region Fields

        private static TextWriterTraceListener writer;
        private static FileStream fileStream;

        #endregion

        #region CTOR

        static Logger()
        {
            fileStream = new FileStream("LogFile.log", FileMode.Create);
            writer = new TextWriterTraceListener(fileStream, "Seciovni");
        }

        #endregion

        #region Indentation

        public static void Indent()
        {
            ++writer.IndentLevel;
        }

        public static void Unindent()
        {
            --writer.IndentLevel;
        }

        #endregion

        #region Writers

        /// <summary>
        /// Writes an error log
        /// </summary>
        /// <param name="msg">The message to write</param>
        public static void WriteError(string msg) { WriteLog(msg, "Error"); }

        /// <summary>
        /// Writes an info log
        /// </summary>
        /// <param name="msg">The message to write</param>
        public static void WriteInfo(string msg) { WriteLog(msg, "Info"); }

        /// <summary>
        /// Write a line ot the log
        /// </summary>
        /// <param name="msg">The message to write</param>
        public static void WriteLine(string msg) { writer.WriteLine(msg, null); }

        /// <summary>
        /// Writes a warning log
        /// </summary>
        /// <param name="msg">The message to write</param>
        public static void WriteWarning(string msg) { WriteLog(msg, "Warning"); }

        /// <summary>
        /// Writes a log with the given log level
        /// </summary>
        /// <param name="msg">The message to write</param>
        /// <param name="logLevel">The log level to use</param>
        private  static void WriteLog(string msg, string logLevel)
        {
            string message = $"{DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")} - {logLevel} - {msg}";

            Debug.WriteLine(message);
            writer.WriteLine(msg, null);
            writer.Flush();
        }

        #endregion
    }
}
