import { useState, useEffect } from "react";
import { writeListenerData, readListenerData, deleteListenerData } from "@/firebase"; 
import { useRouter } from "next/router";

interface TeeTimeListener {
  course: string;
  minTime: string;
  maxTime: string;
  players: string;
  day: string;
  id: string;
}

const Home = () => {
  const [listeners, setListeners] = useState<TeeTimeListener[]>([]);
  const [course, setCourse] = useState("");
  const [minTime, setMinTime] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [players, setPlayers] = useState("any");
  const [day, setDay] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [user, setUser] = useState();
  const router = useRouter();

  // Redirect to login page if user is not logged in
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    console.log("whats this", loggedInUser)
    if (!loggedInUser) {
      router.push("/"); // Redirect to login if no user is logged in
    } else {
      setUser(JSON.parse(loggedInUser))
      setLoading(false); // Set loading to false once login check is complete
    }
  }, [router]);

  useEffect(() => {
    const fetchListeners = async () => {
      const data = await readListenerData();
      if (data) {
        const listenersList: TeeTimeListener[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setListeners(listenersList);
      }
    };
    fetchListeners();
  }, []);

  const handleDayClick = () => {
    document.getElementById("dayInput")?.showPicker();
  };

  const handleMinTimeClick = () => {
    document.getElementById("minTimeInput")?.showPicker();
  };

  const handleMaxTimeClick = () => {
    document.getElementById("maxTimeInput")?.showPicker();
  };

  const convertTo12HourFormat = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    let hours12 = parseInt(hours, 10);
    const period = hours12 >= 12 ? 'PM' : 'AM';
    if (hours12 > 12) {
      hours12 -= 12;
    } else if (hours12 === 0) {
      hours12 = 12;
    }
    return `${hours12}:${minutes} ${period}`;
  };

  const convertTo12HourFormat2 = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    let hours12 = parseInt(hours, 10);
    const period = hours12 >= 12 ? 'pm' : 'am';
    if (hours12 > 12) {
      hours12 -= 12;
    } else if (hours12 === 0) {
      hours12 = 12;
    }
    // Ensure two-digit hour formatting (e.g., "03" instead of "3")
    const formattedHours = hours12 < 10 ? `0${hours12}` : `${hours12}`;
    // No space between time and period
    return `${formattedHours}:${minutes}${period}`;
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpinner(true)

    const formattedMinTime = convertTo12HourFormat2(minTime);
    const formattedMaxTime = convertTo12HourFormat2(maxTime);
    const response = await fetch('/api/sshListener', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course, day, minTime: formattedMinTime, maxTime: formattedMaxTime, players, user: user?.username }),
    });

    if (response.ok) {
      console.log('SSH command executed successfully');
    } else {
      console.error('Failed to execute SSH command');
    }

    if (course && minTime && maxTime && players && day) {
      const newListener: TeeTimeListener = {
        course,
        minTime: convertTo12HourFormat(minTime),
        maxTime: convertTo12HourFormat(maxTime),
        players,
        day,
        id: Date.now().toString(),
      };

      writeListenerData(newListener.id, newListener);
      setListeners(prevListeners => [...prevListeners, newListener]);
    }

    setCourse('');
    setMinTime('');
    setMaxTime('');
    setPlayers('any');
    setDay('');
    setSpinner(false);
  };

  const handleDeleteListener = (listenerId: string) => {
    setListeners(listeners.filter(listener => listener.id !== listenerId));
    deleteListenerData(listenerId);
  };

  const checkFormValidity = () => {
    console.log("course", course)
    console.log("minTime", minTime)
    console.log("maxTime", maxTime)
    console.log("day", day)
    setIsFormValid(course !== "" && minTime !== "" && maxTime !== "" && day !== "");
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser"); // Clear the logged-in user data from localStorage
    router.push("/"); // Redirect to the login page
  };

  // Don't render anything until the login check is complete
  if (loading) {
    return null; // Or you can render a loading spinner or message here if desired
  }

  return (
    <div className="home-container">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      <h2>Tee Time Listeners</h2>
      <div>
        <h3>Current Tee Time Listeners</h3>
        <ul>
          {listeners.length === 0 ? (
            <p>No listeners yet.</p>
          ) : (
            listeners.map((listener) => (
              <li key={listener.id} className="listener-item">
                {listener.course} | {listener.day} | {listener.minTime} - {listener.maxTime} | {listener.players}
                <button onClick={() => handleDeleteListener(listener.id)} className="delete-btn">❌</button>
              </li>
            ))
          )}
        </ul>
      </div>
      <h3>Create a New Tee Time Listener</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Course:</label>
          <select value={course} onChange={(e) => setCourse(e.target.value)} onBlur={checkFormValidity}>
            <option value="">Select Course</option>
            <option value="Charleston Municipal">Charleston Municipal</option>
            <option value="Wescott Golf Club">Wescott Golf Club</option>
          </select>
        </div>
        <div>
          <label>Day of the Year:</label>
          <input type="date" id="dayInput" value={day} onChange={(e) => setDay(e.target.value)} onBlur={checkFormValidity} onClick={handleDayClick} />
        </div>
        <div>
          <label>Min Time:</label>
          <input type="time" id="minTimeInput" value={minTime} onChange={(e) => setMinTime(e.target.value)} onBlur={checkFormValidity} onClick={handleMinTimeClick} />
        </div>
        <div>
          <label>Max Time:</label>
          <input type="time" id="maxTimeInput" value={maxTime} onChange={(e) => setMaxTime(e.target.value)} onBlur={checkFormValidity} onClick={handleMaxTimeClick} />
        </div>
        <div>
          <label>Number of Players:</label>
          <select value={players} onChange={(e) => setPlayers(e.target.value)}>
            <option value="any">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <button type="submit" disabled={!isFormValid}>{isFormValid ? "Submit" : "Fill all fields"}</button>
      </form>
      {spinner && <div className="spinner"></div>}
    </div>
  );
};

export default Home;
