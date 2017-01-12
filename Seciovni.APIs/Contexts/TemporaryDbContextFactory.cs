using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Seciovni.APIs.Contexts
{
    public class TemporaryDbContextFactory : IDbContextFactory<SeciovniContext>
    {
        public SeciovniContext Create(DbContextFactoryOptions options)
        {
            var builder = new DbContextOptionsBuilder<SeciovniContext>();
            builder.UseSqlServer(@"Data Source=(LocalDb)\MSSQLLocalDB;Initial Catalog=SeciovniDatabase;Integrated Security=True");
            return new SeciovniContext(builder.Options);
        }
    }
}
