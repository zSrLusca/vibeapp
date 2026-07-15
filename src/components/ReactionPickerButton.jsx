import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { REACTIONS } from "../constants/reactions";
import ReactionEmoji from "./ReactionEmoji";

function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsTouch(query.matches);
    const handler = (e) => setIsTouch(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return isTouch;
}

export default function ReactionPickerButton({
  myReactionType,
  onReact,
  compact = false,
  loginHref = "/login",
}) {
  const [showPicker, setShowPicker] = useState(false);
  const hideTimer = useRef(null);
  const longPressTimer = useRef(null);
  const didLongPress = useRef(false);
  const rootRef = useRef(null);
  const isTouch = useTouchDevice();

  function openPicker() {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShowPicker(true);
  }

  function closePicker() {
    setShowPicker(false);
  }

  function scheduleClose() {
    if (isTouch) return;
    hideTimer.current = setTimeout(closePicker, 200);
  }

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!showPicker || !isTouch) return;

    function handleOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        closePicker();
      }
    }

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [showPicker, isTouch]);

  const label = myReactionType
    ? REACTIONS.find((r) => r.type === myReactionType)?.label
    : "Curtir";

  function handleReact(type) {
    closePicker();
    onReact(type);
  }

  function handlePointerDown() {
    if (!isTouch) return;
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      openPicker();
    }, 450);
  }

  function handlePointerUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleMainClick() {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    handleReact(myReactionType || "like");
  }

  if (!onReact) {
    if (compact) {
      return (
        <Link to={loginHref} className="comment-action-btn">
          Curtir
        </Link>
      );
    }

    return (
      <Link to={loginHref} className="interaction-btn">
        <ReactionEmoji type="like" size={18} className="interaction-btn-emoji" />{" "}
        Curtir
      </Link>
    );
  }

  const btnClass = compact
    ? `comment-action-btn${myReactionType ? " active" : ""}`
    : `interaction-btn${myReactionType ? " active" : ""}`;

  return (
    <div
      ref={rootRef}
      className={`reaction-action${compact ? " reaction-action--compact" : ""}${isTouch ? " reaction-action--touch" : ""}`}
      onMouseEnter={isTouch ? undefined : openPicker}
      onMouseLeave={isTouch ? undefined : scheduleClose}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={`reaction-picker-anchor${showPicker ? " open" : ""}`}
        aria-hidden={!showPicker}
      >
        <div
          className={`reaction-picker${compact ? " reaction-picker--compact" : ""}`}
        >
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              type="button"
              className={`reaction-picker-btn${compact ? " reaction-picker-btn--compact" : ""}`}
              title={r.label}
              onClick={() => handleReact(r.type)}
            >
              <ReactionEmoji type={r.type} size={compact ? 28 : 32} />
            </button>
          ))}
        </div>
      </div>
      <button type="button" className={btnClass} onClick={handleMainClick}>
        {compact ? (
          myReactionType ? (
            <>
              <ReactionEmoji type={myReactionType} size={14} /> {label}
            </>
          ) : (
            "Curtir"
          )
        ) : (
          <>
            <ReactionEmoji
              type={myReactionType || "like"}
              size={18}
              className="interaction-btn-emoji"
            />{" "}
            {label}
          </>
        )}
      </button>
    </div>
  );
}
