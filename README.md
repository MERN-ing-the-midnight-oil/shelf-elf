# Shelf-Elf Project Documentation

Welcome to the documentation for Shelf-Elf, a platform designed for sharing books and games within communities. This document provides a detailed overview of the application's front-end components, backend routing, and database models, offering insights into the structure, technologies, and design patterns utilized.

## Table of Contents

- [Front End Components](#front-end-components)
  - [App.tsx](#apptsx)
  - [Index.tsx](#indextsx)
  - [Authentication Components](#authentication-components)
    - [LoginForm.tsx](#loginformtsx)
    - [RegisterForm.tsx](#registerformtsx)
  - [AuthContext.tsx](#authcontexttsx)
  - [Community Management Components](#community-management-components)
    - [ManageCommunities.tsx](#managecommunitiestsx)
  - [Game Management Components](#game-management-components)
    - [AvailableGames.tsx](#availablegamestsx)
    - [MyLendingLibraryGames.tsx](#mylendinglibrarygamestsx)
    - [LendForm.tsx](#lendformtsx)
    - [RequestBooks.tsx](#requestbookstsx)
  - [Layout Components](#layout-components)
    - [Header.tsx](#headertsx)
    - [LandingHeader.tsx](#landingheadertsx)
  - [Utility Components](#utility-components)
    - [Messages.tsx](#messagestsx)
  - [Dynamic Forms](#dynamic-forms)
- [Backend Routes Overview](#backend-routes-overview)
  - [Books Routes](#books-routes)
  - [Communities Routes](#communities-routes)
  - [Games Routes](#games-routes)
  - [Messages Routes](#messages-routes)
  - [Users Routes](#users-routes)
- [Database Models Overview](#database-models-overview)
  - [Book Model](#book-model)
  - [Community Model](#community-model)
  - [Game Model](#game-model)
  - [Message Model](#message-model)
  - [User Model](#user-model)
  - [Lending Library Game Model](#lending-library-game-model)
  - [Game Request Model](#game-request-model)

# Front End Components

This section details the front-end components of Shelf-Elf, outlining the structure, technologies, and design patterns used to create a user-friendly and maintainable application. These components can be found in the "components" section of the "src" folder.

## App.tsx

Serves as the central hub for routing with React Router. It demonstrates the use of conditional rendering based on authentication status and dynamically loads components based on the route. This setup exemplifies a clear separation of concerns and effective state management to control user flow throughout the application.

## Index.tsx

Acts as the launching point for the React app, showcasing the integration with Redux for global state management (if used) and setting up the Provider for React context. This file is crucial for initializing the application's core functionalities and state.

## Authentication Components

### LoginForm.tsx

Illustrates a robust form handling strategy using controlled components for form inputs and local state to manage user input, errors, and submission status. It's a prime example of handling user authentication and validation in React.

### RegisterForm.tsx

Demonstrates complex state management and conditional rendering based on form validation feedback. It also incorporates custom hooks for data fetching, showing how to interact with external APIs securely and efficiently.

## AuthContext.tsx

A crucial component for managing global authentication state throughout Shelf-Elf. It leverages the React Context API and Hooks to provide a centralized way to manage user authentication status, making it accessible to any component in the application hierarchy without prop drilling. This context encapsulates logic for login, logout, and authentication status checks, showcasing an effective pattern for managing and accessing global state. The use of custom hooks within this context (`useAuth`) further simplifies the consumption of authentication-related data and functions across the app, demonstrating a clean separation of concerns and enhancing code reusability.

### Highlights:

- **Global State Management**: Utilizes React Context to manage and distribute authentication state globally, demonstrating an alternative to prop drilling for accessing global state.
- **Custom Hooks**: Implements custom hooks (e.g., `useAuth`) to provide a clean, reusable interface for accessing context values, demonstrating how to encapsulate and reuse complex logic across components.
- **Security and Usability**: By centralizing authentication logic, it ensures consistent security checks (e.g., verifying if a user is logged in) across the application, improving both security and user experience.

This component ensures that authentication state is handled efficiently and securely.

## Community Management Components

### ManageCommunities.tsx

This component is a testament to the application's scalability, allowing users to create and manage their communities. It utilizes state lifting to handle community data, showcasing how to manage complex state interactions across sibling components.

## Game Management Components

### AvailableGames.tsx

Displays available games using a grid layout, incorporating responsive design principles. It fetches game data from a backend API, demonstrating asynchronous data fetching and error handling in React components.

### MyLendingLibraryGames.tsx

Focuses on CRUD operations within React, allowing users to manage their game listings. It highlights state synchronization between the client and server and optimizes re-renders for performance.

### LendForm.tsx

Uses formik for form management, showcasing its integration for complex form scenarios with multiple inputs and validation rules. It's a great example of leveraging third-party libraries to simplify development.

### RequestBooks.tsx

Features real-time search with debouncing, efficiently managing API calls and updating UI responsively. This component exemplifies the use of custom hooks for debouncing and managing side effects.

## Layout Components

### Header.tsx

Implements a responsive navigation bar, adapting to the user's authentication status. This component showcases conditional rendering and the use of React Router's `NavLink` for active styling.

### LandingHeader.tsx

Serves as the welcoming point of the application, using dynamic styling and animations to create an engaging user experience. It demonstrates how to incorporate CSS-in-JS for component-specific styling.

## Utility Components

### Messages.tsx

Handles in-app messaging, illustrating state management for real-time data like chat messages. It shows efficient data fetching and updates, utilizing WebSocket (or similar technology) for real-time communication.

## Dynamic Forms

- **Real-time Search with Debouncing**: Efficiently handles API calls with debouncing, ensuring the application remains performant while providing real-time feedback to the user.
- **Interactive Registration**: Enhances the user experience with dynamic validation, giving immediate feedback on input errors during registration.
- **Responsive Book Search Form**: Demonstrates the use of controlled inputs and state to provide a seamless, dynamic search experience.
- **Form State Tracking**: Utilizes state effectively to track user inputs, ensuring a responsive UI and minimizing user errors.

# Backend Routes Overview

The routing structure of the Shelf-Elf application is organized into distinct domains to streamline the functionality related to books, communities, games, messages, and user authentication. This organization facilitates maintenance, scalability, and a clear separation of concerns within the backend architecture.

## Table of Contents

- [Books Routes](#books-routes)
- [Communities Routes](#communities-routes)
- [Games Routes](#games-routes)
- [Messages Routes](#messages-routes)
- [Users Routes](#users-routes)

## Books Routes

Handle all operations related to book sharing, including adding books to a user's library, borrowing, and returning books.

### Features:

- **Book Management**: Users can add, delete, and mark books as borrowed or returned.
- **Community Library**: Fetch books available within user communities.

### Endpoints:

- `POST /books/add`: Adds a new book to the user's library.
- `DELETE /books/delete-offer/:bookId`: Removes a book offer from the user's library.
- `GET /books/my-library`: Lists all books in the user's personal lending library.

## Communities Routes

Facilitates creating and managing communities, allowing users to find and join communities of interest.

### Features:

- **Community Creation**: Users can create new communities with a name, description, and passcode.
- **Join/Leave Community**: Provides functionality for users to join communities or leave them.

### Endpoints:

- `POST /communities/create`: Creates a new community.
- `POST /communities/join`: Joins an existing community.
- `POST /communities/:communityId/leave`: Leaves a specified community.

## Games Routes

Supports operations related to game sharing within the platform, including lending and borrowing games.

### Features:

- **Lend a Game**: Users can add games to their lending library, making them available for others to borrow.
- **Search and Borrow Games**: Allows users to search for and borrow games from other users' libraries.

### Endpoints:

- `POST /games/lend`: Adds a game to the lending library.
- `PATCH /games/mark-unavailable/:gameId`: Marks a game as unavailable for borrowing.

## Messages Routes

Enables direct communication between users through messages, enhancing collaboration and coordination for borrowing and lending.

### Features:

- **Send Messages**: Users can send messages to one another, facilitating communication.
- **View Messages**: Users can view their message history with other users.

### Endpoints:

- `POST /messages/send`: Sends a new message to another user.
- `GET /messages/with/:userId`: Fetches the message history between two users.

## Users Routes

Handles user authentication, registration, and profile management, ensuring secure access to the application.

### Features:

- **User Authentication**: Secure login and registration process for users.
- **Profile Management**: Users can view and update their profiles.

### Endpoints:

- `POST /users/register`: Registers a new user.
- `POST /users/login`: Authenticates a user and returns a token.
- `GET /users/me`: Retrieves the authenticated user's profile details.

# Database Models Overview

The "Shelf-Elf" application utilizes several Mongoose models to structure the data related to books, communities, games, messages, user accounts, and lending library games. These models are essential for managing the application's core functionalities, including user interactions, resource sharing, and community engagement.

## Table of Contents

- [Book Model](#book-model)
- [Community Model](#community-model)
- [Game Model](#game-model)
- [Message Model](#message-model)
- [User Model](#user-model)
- [Lending Library Game Model](#lending-library-game-model)
- [Game Request Model](#game-request-model)

## Book Model

Represents books shared within the platform. It includes details such as title, author, and the current availability status. Books are linked to their owners and potential borrowers, facilitating the sharing process.

### Features:

- **Dynamic Status**: Tracks if a book is available, checked out, or unavailable.
- **Ownership and Borrowing**: Connects books to users for lending and borrowing.

## Community Model

Defines communities where users can gather to share and discuss books and games. Each community has a name, description, members, and a unique passcode for access control.

### Features:

- **Exclusive Membership**: Uses passcodes to manage community membership.
- **Social Interaction**: Encourages users to join communities of interest.

## Game Model

Describes board games available for lending. It contains information such as the title, BoardGameGeek rating, and links to further details, supporting the game sharing aspect of the application.

### Features:

- **BoardGameGeek Integration**: Stores IDs and ratings from BoardGameGeek for reference.
- **Thumbnail Management**: Optionally stores URLs to game thumbnails for visual representation.

## Message Model

Facilitates in-app messaging between users, with references to the sender and receiver. It's pivotal for communication related to borrowing and lending items.

### Features:

- **Read Receipts**: Tracks whether messages have been read, enhancing user interaction.
- **Timestamped Conversations**: Orders messages chronologically for easy reading.

## User Model

Central to the application, the User model stores information about individuals using the platform. It references the books and games they are lending, the communities they belong to, and their interactions within those communities.

### Features:

- **Comprehensive Relationships**: Links users to books, games, communities, and messages.
- **Password Storage**: Manages user authentication securely.

## Lending Library Game Model

Specific to games being lent out, this model tracks the availability of games, their owners, and any requests from other users to borrow them.

### Features:

- **Availability Tracking**: Indicates whether a game is currently available for borrowing.
- **Request Management**: Lists users who have requested the game, facilitating lending decisions.

## Game Request Model

Manages requests made by users to borrow games, including the status of each request and any related messages. This model enhances the game lending process by providing a structured way to handle requests.

### Features:

- **Communication Support**: Optionally stores messages exchanged during the request process.

These models form the backbone of the "Shelf-Elf" application, enabling a rich feature set and a robust data management system. By clearly defining the relationships between users, their shared resources, and their interactions, the application provides a comprehensive platform for book and game sharing within communities.
