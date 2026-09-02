FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TaskManagement.API/TaskManagement.API.csproj", "TaskManagement.API/"]
COPY ["TaskManagement.Core/TaskManagement.Core.csproj", "TaskManagement.Core/"]
COPY ["TaskManagement.Infrastructure/TaskManagement.Infrastructure.csproj", "TaskManagement.Infrastructure/"]
RUN dotnet restore "TaskManagement.API/TaskManagement.API.csproj"
COPY . .
WORKDIR "/src/TaskManagement.API"
RUN dotnet build "TaskManagement.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskManagement.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskManagement.API.dll"]
