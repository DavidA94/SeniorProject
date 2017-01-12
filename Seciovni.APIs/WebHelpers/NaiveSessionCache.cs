using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System.Threading;

namespace Seciovni.APIs.WebHelpers
{
    public class NativeSessionCache : TokenCache
    {
        private static ReaderWriterLockSlim SessionLock = new ReaderWriterLockSlim(LockRecursionPolicy.NoRecursion);
        private static byte[] CacheValue = null;
        string UserObjectId = string.Empty;
        string CacheId = string.Empty;

        public NativeSessionCache(string userId)
        {
            UserObjectId = userId;
            CacheId = UserObjectId + "_TokenCache";

            AfterAccess = AfterAccessNotification;
            BeforeAccess = BeforeAccessNotification;
            Load();
        }

        private void Load()
        {
            SessionLock.EnterReadLock();
            Deserialize(CacheValue);
            SessionLock.ExitReadLock();
        }

        public void Persist()
        {
            SessionLock.EnterWriteLock();

            // Optimistically set HasStateChanged to false. We need to do it early to avoid losing changes made by a concurrent thread.
            HasStateChanged = false;

            // Reflect changes in the persistent store
            CacheValue = Serialize();

            SessionLock.ExitWriteLock();
        }

        public override void Clear()
        {
            base.Clear();
            CacheValue = null;
        }

        private void BeforeAccessNotification(TokenCacheNotificationArgs args)
        {
            Load();
        }

        private void AfterAccessNotification(TokenCacheNotificationArgs args)
        {
            if (HasStateChanged)
            {
                Persist();
            }
        }
    }
}
