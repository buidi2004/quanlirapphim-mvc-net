#!/bin/bash
set -e

echo "1. Creating new directories..."
mkdir -p Domain/Entities
mkdir -p Domain/Exceptions
mkdir -p Domain/ValueObjects
mkdir -p Application/Interfaces
mkdir -p Application/Services
mkdir -p Application/ViewModels
mkdir -p Infrastructure/Repositories
mkdir -p Infrastructure/Data
mkdir -p Infrastructure/Services

echo "2. Moving files..."
mv Models/Domain/* Domain/Entities/ 2>/dev/null || true
mv Core/Exceptions/* Domain/Exceptions/ 2>/dev/null || true
mv Core/ValueObjects/* Domain/ValueObjects/ 2>/dev/null || true

mv Models/Repository/Interfaces/* Application/Interfaces/ 2>/dev/null || true
mv Models/Services/Interfaces/* Application/Interfaces/ 2>/dev/null || true

mv Models/Services/Implementations/* Application/Services/ 2>/dev/null || true
mv ViewModels/* Application/ViewModels/ 2>/dev/null || true

mv Models/Repository/Implementations/* Infrastructure/Repositories/ 2>/dev/null || true
mv Data/* Infrastructure/Data/ 2>/dev/null || true
mv Services/* Infrastructure/Services/ 2>/dev/null || true

echo "3. Cleaning up old directories..."
rm -rf Models/Domain Models/Repository/Interfaces Models/Repository/Implementations Models/Repository Models/Services/Interfaces Models/Services/Implementations Models/Services Models Core/Exceptions Core/ValueObjects Core ViewModels Data Services || true

echo "4. Global Namespace Replacements..."
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Models\.Domain/CinemaXNet.Domain.Entities/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Models\.Repository\.Interfaces/CinemaXNet.Application.Interfaces/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Models\.Services\.Interfaces/CinemaXNet.Application.Interfaces/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Models\.Repository\.Implementations/CinemaXNet.Infrastructure.Repositories/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Models\.Services\.Implementations/CinemaXNet.Application.Services/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.ViewModels/CinemaXNet.Application.ViewModels/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Data/CinemaXNet.Infrastructure.Data/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Core\.Exceptions/CinemaXNet.Domain.Exceptions/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Core\.ValueObjects/CinemaXNet.Domain.ValueObjects/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Services/CinemaXNet.Infrastructure.Services/g'
find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -print0 | xargs -0 sed -i '' 's/CinemaXNet\.Core/CinemaXNet.Domain/g'

echo "Done."
