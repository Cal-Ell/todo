import { useState, useEffect, useRef, useCallback } from "react";

const useStickyHeader = (defaultSticky = false) => {
    const [isSticky, setIsSticky] = useState(defaultSticky);
    const [isStickyRow, setStickyRow] = useState(defaultSticky);
    const tableRef = useRef(null);

    const toggleStickiness = useCallback(
        ({ top, bottom }) => {
            if (top <= 2) {
                !isSticky && setIsSticky(true);
            } else {
                isSticky && setIsSticky(false);
            }  
            if (bottom <= 270) {
                !isStickyRow && setStickyRow(true);
            } else {
                isStickyRow && setStickyRow(false);
            }  
            //console.log(top);         
        },
        [isSticky, isStickyRow]
    );

    useEffect(() => {
        const handleScroll = () => {
            toggleStickiness(tableRef.current.getBoundingClientRect());
        };
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [toggleStickiness]);

    return { tableRef, isSticky, isStickyRow };
};

export default useStickyHeader;
