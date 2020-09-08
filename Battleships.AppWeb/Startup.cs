using Battleships.DAL;
using Battleships.Models;
using Battleships.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;

namespace Battleships_Online
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication(opts =>
            {
                opts.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                opts.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opts.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(cfg =>
            {
                cfg.RequireHttpsMetadata = false;
                cfg.SaveToken = true;
                cfg.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidIssuer = Configuration["Auth:JsonWebToken:Issuer"],
                    ValidAudience = Configuration["Auth:JsonWebToken:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Auth:JsonWebToken:Key"])),
                    ClockSkew = TimeSpan.Zero,
                    RequireExpirationTime = false,
                    ValidateIssuer = false,
                    ValidateIssuerSigningKey = false,
                    ValidateAudience = false
                };
            })
            .AddFacebook(options =>
            {
                options.AppId = Configuration["Auth:Facebook:AppId"];
                options.AppSecret = Configuration["Auth:Facebook:AppSecret"];
            })
            .Services.ConfigureApplicationCookie(options =>
            {
                //previous cookies not valid
                options.SlidingExpiration = true;
                options.ExpireTimeSpan = TimeSpan.FromMinutes(1);
            });

            services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(Configuration["Data:M_K_Server:ConnectionString"]));

            services.AddIdentity<AppUser, IdentityRole>(opts => {
                opts.User.RequireUniqueEmail = true;
                opts.User.AllowedUserNameCharacters = null; //disable validation
                opts.Password.RequireNonAlphanumeric = false;
                opts.Password.RequireLowercase = false;
                opts.Password.RequireUppercase = false;
                opts.Password.RequireDigit = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.WithOrigins("http://localhost:4200")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .SetIsOriginAllowed((host) => true));
            });

            services.AddTransient<IEmailSender, EmailSender>();
            services.AddTransient<IUserValidation, UserValidation>();
            services.AddTransient<IInputSanitizer, InputSanitizer>();

            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("CorsPolicy");
            app.UseAuthentication();
            app.UseMvc(routes => {
                routes.MapRoute(name: "Error", template: "Error",
                defaults: new { controller = "Error", action = "Error" });
                routes.MapRoute(name: "default", template: "{controller}/{action}/{id?}",
                defaults: new { controller = "Home", action = "Index" });
            });
        }
    }
}
