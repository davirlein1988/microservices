import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";
export default () => {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    { doRequest, errors } = useRequest({
      url: "/api/users/signup",
      method: "post",
      body: { email, password },
      onSuccess: () => Router.push("/"),
    }),
    handleSubmit = async (event) => {
      event.preventDefault();

      doRequest();
    };
  return (
    <form onSubmit={handleSubmit}>
      <h1>Sigup</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
          autoComplete="off"
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};
