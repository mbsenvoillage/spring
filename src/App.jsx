/* eslint-disable react/prop-types */
import { useState, useEffect, memo } from "react";
import "./App.css";
import { throttle } from "lodash";
import { useSpring, animated, config } from "@react-spring/web";

const PayButton = ({ isOnline }) => {
  useEffect(() => {
    console.log("Rendering <PayButton />");
  });
  return <div>{isOnline ? "You can pay" : "You can't pay"}</div>;
};

const MemoizedPayButton = memo(PayButton);

const Total = ({ total }) => {
  useEffect(() => {
    console.log("Rendering <Total />");
  });
  return <p>Total is: {total ?? 0} euros</p>;
};

const MemoizedTotal = memo(Total);

const Item = ({ name, price, ean }) => {
  useEffect(() => {
    console.log("Rendering <Item /> with ean: " + ean);
  });

  const [prevPrice, setPrevPrice] = useState(price);

  // Check if the price has changed. If so, trigger an animation
  useEffect(() => {
    if (prevPrice !== price) {
      setPrevPrice(price);
    }
  }, [price, prevPrice]);

  // Configure the animation
  const props = useSpring({
    // Start from 30px above its normal position
    from: { transform: "translateY(-30px)", opacity: 0 },
    // Move to its normal position
    to: { transform: "translateY(0px)", opacity: 1 },
    reset: prevPrice !== price,
    config: config.stiff, // Adjust for desired slide-down feel
  });

  return (
    <animated.div style={props}>
      <p>{name}</p>
      <p>{price}</p>
      <p>{ean}</p>
    </animated.div>
  );
};

const MemoizedItem = memo(Item);

const ItemList = ({ items }) => {
  useEffect(() => {
    // This effect is executed every new render
    console.log("Rendering <ItemList />");
  });
  return items?.map((item) => {
    return (
      <MemoizedItem
        price={item.price}
        ean={item.ean}
        name={item.name}
        key={item.ean}
      />
    );
  });
};

const MemoizedItemList = memo(ItemList);

const ws = new WebSocket("ws://localhost:8080");
ws.addEventListener("open", () => {
  console.log("We are connected");
  ws.send("How are you?");
});

function App() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // This effect is executed every new render
    console.log("Rendering <App />");
  });

  useEffect(() => {
    const messageHandler = throttle(function (event) {
      const data = JSON.parse(event.data);
      console.log(data);
      setItems(data.items);
      setTotal(data.total);
      setIsOnline(data.isOnline);
    }, 500);

    ws.addEventListener("message", messageHandler);

    // Clean up the event listener when the component is unmounted.
    return () => {
      ws.removeEventListener("message", messageHandler);
    };
  }, []);

  return (
    <>
      <h1>Basket</h1>
      <MemoizedItemList items={items} />
      <MemoizedTotal total={total} />
      <MemoizedPayButton isOnline={isOnline} />
    </>
  );
}

export default App;
