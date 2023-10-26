import { useState, useEffect, useCallback, useRef } from "react";
import { parseLinkHeader } from "../reference/parseLinkHeader";
import "../reference/styles.css";

const LIMIT = 10;
const URL = "http://localhost:3000/photos";
// const URL="http://localhost:3000/photos-short-list"

function App() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const nextPhotoUrlRef = useRef();

  async function fetchPhotos(url, { overwrite = false } = {}) {
    setIsLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      const res = await fetch(url);
      nextPhotoUrlRef.current = parseLinkHeader(res.headers.get("Link")).next;
      const fetchedPhotos = await res.json();
      if (overwrite) {
        setPhotos(fetchedPhotos);
      } else {
        setPhotos(photos => [...photos, ...fetchedPhotos]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const imageRef = useCallback(image => {
    if (image == null || nextPhotoUrlRef.current == null) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        //TODO: Load next elements

        fetchPhotos(nextPhotoUrlRef.current);

        console.log("last element shown!");
        observer.unobserve(image);
      }
    });
    observer.observe(image);
  }, []);

  useEffect(() => {
    fetchPhotos(`${URL}?_page=1&_limit=${LIMIT}`, {
      overwrite: true,
    });
  }, []);

  return (
    <div className="grid">
      {photos.map((photo, index) => (
        <img
          src={photo.url}
          key={photo.id}
          ref={index === photos.length - 1 ? imageRef : undefined}
        />
      ))}
      {isLoading &&
        Array.from({ length: LIMIT }, (_, index) => index).map(n => {
          return (
            <div className="skeleton" key={n}>
              Loading...
            </div>
          );
        })}
    </div>
  );
}

export default App;
