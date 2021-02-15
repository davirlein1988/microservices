import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const NewTicket = () => {
  const [title, setTitle] = useState(""),
    [price, setPrice] = useState(null),
    { doRequest, errors } = useRequest({
      url: "/api/tickets",
      method: "post",
      body: {
        title,
        price,
      },
      onSuccess: () => Router.push("/"),
    }),
    onSubmit = (e) => {
      e.preventDefault();
      doRequest();
    },
    onBlur = () => {
      const value = parseFloat(price);
      if (isNaN(value)) {
        return;
      }
      setPrice(value.toFixed(2));
    };
  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-goup">
          <label>Title</label>
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            className="form-control"
          />
        </div>
        <div className="form-goup">
          <label>Price</label>
          <input
            value={price}
            onChange={({ target }) => setPrice(target.value)}
            onBlur={onBlur}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;
