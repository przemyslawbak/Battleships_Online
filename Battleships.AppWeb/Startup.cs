using Battleships.DAL;
using Battleships.Helpers;
using Battleships.Hubs;
using Battleships.Models;
using Battleships.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using System.Threading.Tasks;

namespace Battleships_Online
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

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
                cfg.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        StringValues accessToken = context.Request.Query["access_token"];
                        // If the request is for SignalR hub
                        PathString path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken))
                        {
                            // Read the token out of the query string
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            })
            .AddGoogle(options =>
            {
                options.ClientId = Configuration["Auth:Google:ClientId"];
                options.ClientSecret = Configuration["Auth:Google:ClientSecret"];
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
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services.AddTransient<ITokenRepository, EFTokenRepository>();
            services.AddTransient<IUserRepository, EFUserRepository>();
            services.AddTransient<TokenManagerMiddleware>();
            services.AddTransient<IEmailSender, EmailSender>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IInputSanitizer, InputSanitizer>();
            services.AddTransient<ITokenService, TokenService>();
            services.AddTransient<IHttpService, HttpService>();
            services.AddTransient<IHttpClientProvider, HttpClientProvider>();
            services.AddTransient<IMemoryAccess, MemoryAccess>();
            services.AddTransient<IGameService, GameService>();
            services.AddScoped<ValidateModelAttribute>();
            services.AddScoped<SanitizeModelAttribute>();
            services.AddScoped<VerifyCaptchaAttribute>();
            services.AddSignalR();
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
            app.UseSignalR(routes =>
            {
                routes.MapHub<MessageHub>("/messageHub");
            });
            app.UseMiddleware<TokenManagerMiddleware>();
            app.UseMvc();
        }
    }
}
