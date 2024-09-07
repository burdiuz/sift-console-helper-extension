import { useEffect, useRef, useState } from "react";

export const HeightProvider = ({reservedTop = 28, children}) => {
  const ref = useRef();
  const [height, setHeight] = useState(window.innerHeight - reservedTop);

  useEffect(() => {
    setHeight(
      window.innerHeight - (ref.current?.getBoundingClientRect().top || reservedTop)
    );
  });

  return children(ref, height);
}