using Database.Tables;
using Database.Tables.ManyManyTables;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Seciovni.APIs.Contexts
{
    public class SeciovniContext : DbContext
    {
        public SeciovniContext(DbContextOptions<SeciovniContext> context) : base(context) { }

        public DbSet<User> Users { get; set; }
        public DbSet<UserLogin> Logins { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<LienHolder> LienHolders { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoicePageTemplate> InvoiceTemplates { get; set; }
        public DbSet<Employee> Employees { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<InvoiceTemplateBinding>().HasKey(b => new { b.UniqueBindingID, b.BindingID });

            #region Many-to-Many Relationships
            builder.Entity<UserPermission>().HasKey(up => new { up.UserID, up.PermissionType });

            builder.Entity<UserPermission>().HasOne(up => up.Permision)
            /**/                            .WithMany(p => p.UserPermissions)
            /**/                            .HasForeignKey(up => up.PermissionType);

            builder.Entity<UserPermission>().HasOne(up => up.User)
            /**/                            .WithMany(u => u.UserPermisions)
            /**/                            .HasForeignKey(up => up.UserID);

            builder.Entity<InvoiceInvoicePageTemplate>().HasKey(ii => new { ii.InvoiceID, ii.TemplateID });

            builder.Entity<InvoiceInvoicePageTemplate>().HasOne(ii => ii.Invoice)
            /**/                                        .WithMany(i => i.IIPT)
            /**/                                        .HasForeignKey(ii => ii.InvoiceID);

            builder.Entity<InvoiceInvoicePageTemplate>().HasOne(ii => ii.InvoicePageTempate)
            /**/                                        .WithMany(i => i.IIPT)
            /**/                                        .HasForeignKey(ii => ii.TemplateID);
            
            #endregion
        }
    }
}
