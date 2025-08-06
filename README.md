# TurfX - Cricket Turf Booking Application

TurfX is a comprehensive cricket turf booking application that allows users to find, book, and manage cricket turfs. The application includes features for user authentication, turf management, booking management, team creation, and payment processing.

## Features

### User Management
- User registration and authentication with JWT
- Role-based access control (User, Admin)
- User profile management
- Password update and reset

### Turf Management
- Browse available cricket turfs
- Search turfs by location, price, and amenities
- View turf details, photos, and availability
- Dynamic pricing based on demand, season, and time

### Booking System
- Book turfs for specific dates and time slots
- View booking history and upcoming bookings
- Cancel bookings with refund calculation
- Receive booking confirmations via email

### Team Management
- Create and manage cricket teams
- Add/remove team members
- Transfer team captaincy
- View team statistics and history

### Payment Integration
- Secure payment processing with Razorpay
- Payment history tracking
- Refund processing for cancellations

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Razorpay Payment Gateway

### Frontend
- React.js
- Tailwind CSS
- Vite

## Project info

**URL**: https://lovable.dev/projects/a8ade50d-41a4-480f-b2fe-cac741bb1ca2

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Razorpay account for payment processing

### Installation

1. Clone the repository
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. Install dependencies
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. Start the development server
   ```sh
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user (Admin)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Turfs
- `GET /api/turfs` - Get all turfs
- `GET /api/turfs/:id` - Get single turf
- `POST /api/turfs` - Create turf (Admin)
- `PUT /api/turfs/:id` - Update turf (Admin)
- `DELETE /api/turfs/:id` - Delete turf (Admin)
- `GET /api/turfs/:id/availability` - Get turf availability

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/me` - Get user bookings

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get single team
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add team member
- `DELETE /api/teams/:id/members/:userId` - Remove team member
- `PUT /api/teams/:id/vice-captain/:userId` - Set vice-captain
- `PUT /api/teams/:id/transfer-captaincy/:userId` - Transfer captaincy
- `GET /api/teams/me` - Get user teams

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments/me` - Get user payments
- `POST /api/payments/:id/refund` - Process refund (Admin)

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Razorpay](https://razorpay.com/)

## How to Edit This Code

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a8ade50d-41a4-480f-b2fe-cac741bb1ca2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
