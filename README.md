# Other's Covers: A Peer-to-Peer Book Lending Library

## The Live Site: https://others-covers-0f4265de0975.herokuapp.com/

## Introduction:

Welcome to Other's Covers. This platform is designed to help book enthusiasts share their collection with others, discover new reads, and manage their personal book collection. Users can log in, dynamically search for books via the Google Books API, and update a persitant and personalized library. Coming soon: the ability to search the libraries of other users, borrow e-books from users around the world, and find books that can be borrowed and returned by neighbors who live near your bicycle commute to work or on your regular dog-walking route around your neighborhood.

---

## Key Functionalities:

1. **User Authentication**:

   - **JWT & State Management**: The authentication system employs JWT tokens, stored both within the React state and in local storage. This ensures a consistent user experience, even across different sessions.

2. **Dynamic Forms**:

   - **Real-time Search with Debouncing**: As users key in their search, the app efficiently communicates with the Google Books API, delivering real-time results while efficiently managing API calls.
   - **Interactive Registration**: The registration process is enhanced by a dynamic password field, optimizing both security and user experience.
   - **Responsive Book Search Form**: As users provide input, the form actively presents corresponding book results, offering a fluid search experience.
   - **Form State Tracking**: User inputs are meticulously tracked in real-time, ensuring a responsive and error-minimized user interface.

3. **User Library Management**:

   - **Personalized Curation**: Users can swiftly add chosen books to their library, making personal collection management a breeze.Additions to the library appear instantly using state.

4. **Conditional Component Rendering**:
   - **Adaptive UI**: Post authentication, users are greeted with tailored components such as the dashboard and "mylendinglibrary", refining the user interface to present only pertinent data.

## Technical Highlights:

1. **React Hooks**: Demonstrating adeptness in modern React paradigms, the app employs various hooks like `useState`, `useEffect`, and `useContext` to adeptly manage side-effects, state, and context.

2. **Context API & State Management**: Global states, such as user's authentication status, are deftly handled using the Context API, exemplifying efficient state management and distribution throughout the app.

3. **Dynamic Forms & Formik**: The amalgamation of dynamic forms with state tracking, supplemented by Formik, accentuates a comprehensive grasp of form management in React, enhancing user experience and data precision.

4. **Custom Components**: Championing modular development, the application is constructed using custom components, which can be smoothly integrated across different app sections, embodying the essence of the DRY principle.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
