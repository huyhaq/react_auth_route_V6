import { useEffect, useState } from "react";
import { BasicPage } from "../components/BasicPage";
import Person from "@mui/icons-material/Person";
import axios from "../configs/axios"
export const User = () => {
  const [users,setUsers]  = useState([])

  useEffect(() => {
    axios.get('/user').then((res) => {
      setUsers(res.data.users);
    })
  },[]);


  return <>
    <div>
      <h1>User</h1>
      {users?.map((user) =>{
        return <p key={user._id}>{user.name}</p>
      })}
    </div>
  
  </>;
};
