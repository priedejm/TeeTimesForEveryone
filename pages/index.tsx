import { useState } from "react";
import { useRouter } from "next/router";
import { getUsersFromDatabase, User } from "@/firebase"; // Import User type from firebase.ts
import { GiGolfTee } from "react-icons/gi"; // Import the golf Tee icon

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Fetch users from Firebase
      const users = await getUsersFromDatabase();

      if (users) {
        // Type assertion: Assume the values are User objects
        const userList = Object.values(users) as User[];

        // Find user by username and password
        const user = userList.find(
          (user: User) => user.username === username && user.password === password
        );

        if (user) {
          // Successful login - save user in localStorage
          localStorage.setItem("loggedInUser", JSON.stringify(user)); // Save to localStorage
          router.push("/home");
        } else {
          setError("Invalid username or password.");
        }
      } else {
        setError("No users found.");
      }
    } catch (err) {
      setError("An error occurred while fetching user data.");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="icon-container">
        <GiGolfTee size={50} color="#45751e" />
      </div>

      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
