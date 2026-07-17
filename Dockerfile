FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
# Install curl for healthcheck (ignore time validation due to WSL/Docker clock drift)
RUN apt-get -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj first for better layer caching
COPY ["CinemaXNet.csproj", "."]
RUN dotnet restore "./CinemaXNet.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "./CinemaXNet.csproj" -c $BUILD_CONFIGURATION -o /app/build --no-restore

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./CinemaXNet.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false --no-restore

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

ENTRYPOINT ["dotnet", "CinemaXNet.dll"]
