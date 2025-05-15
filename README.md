# Block Image 

## Prerequisites

### System Requirements

#### Windows
1. Install Node.js LTS version (recommended v18.x or v20.x)

2. Install Visual Studio Build Tools:
   - Download Visual Studio Installer from [Visual Studio Downloads](https://visualstudio.microsoft.com/downloads/)
   - Choose "Visual Studio Build Tools 2022"
   - In the installer, select "Desktop development with C++"
   - Install selected components

3. Install project dependencies:
```bash
npm install
```

#### Linux
```bash
sudo apt-get update
sudo apt-get install python build-essential
sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
```

#### macOS
```bash
xcode-select --install
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yakovber/block_img.git
cd block_img
```

2. Install dependencies:
```bash
npm install
```

3. Create required directories and verify dependencies:
```bash
node startup.js
```

4. Run database migrations:
```bash
node migrate.js
```

5. Start the server:
```bash
npm start
```

### Development

For development with auto-reload:
```bash
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with:

```env
PORT=3000
JWT_SECRET=your-secret-key
ADMIN_CODE=your-admin-code
```

### Project Structure

```
block_img/
├── src/
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   ├── services/      # Business logic
│   ├── models/        # Database models
│   └── utils/         # Helper functions
├── config/           # Configuration files
├── migrations/       # Database migrations
└── startup.js       # Initialization script
```

### API Documentation

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /block` - Block an image
- `GET /blocked` - Get blocked images
- `POST /request-global` - Request global block
- `POST /admin/approve` - Approve global block request
- `POST /admin/reject` - Reject global block request

### Database Schema

- `users` - User accounts
- `blocked` - Personal blocked images
- `global_blocked` - Globally blocked images
- `pending_images` - Pending block requests
- `pixelated_images` - Processed images data

### Error Handling

The application will check for:
- Required system dependencies
- Directory structure
- Database availability
- Required environment variables

### Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

### License

MIT