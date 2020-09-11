using Battleships.AppWeb.Utilities;
using Battleships.DAL;
using Battleships.Models;
using Battleships.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
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
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .WithOrigins("*localhost:4200", "*.facebook.com")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .SetIsOriginAllowed((host) => true));
            });

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(cfg =>
            {
                cfg.RequireHttpsMetadata = false;
                cfg.SaveToken = true;
                cfg.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Auth:JsonWebToken:Key"])),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidIssuer = Configuration["Auth:JsonWebToken:Issuer"],
                    ValidAudience = Configuration["Auth:JsonWebToken:Audience"],
                    ClockSkew = TimeSpan.Zero, //https://stackoverflow.com/a/46231102/12603542
                    //RequireExpirationTime = false
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

            services.AddIdentity<AppUser, IdentityRole>(opts =>
            {
                opts.User.RequireUniqueEmail = true;
                opts.User.AllowedUserNameCharacters = null; //disable validation
                opts.Password.RequireNonAlphanumeric = false;
                opts.Password.RequireLowercase = false;
                opts.Password.RequireUppercase = false;
                opts.Password.RequireDigit = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            services.AddTransient<TokenManagerMiddleware>();
            services.AddTransient<IEmailSender, EmailSender>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IInputSanitizer, InputSanitizer>();
            services.AddTransient<ITokenService, TokenService>();

            services.AddTransient<ITokenRepository, EFTokenRepository>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {/*
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "AppClient";

                if (env.IsDevelopment())
                {
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:4200"); //https://stackoverflow.com/a/60146427/12603542
                }
            });*/
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("CorsPolicy");
            app.UseAuthentication();
            app.UseMiddleware<TokenManagerMiddleware>();
            app.UseMvc();
        }
    }
}
