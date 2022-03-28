import PortfolioItems from "./post/PortfolioItems";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import parse from "html-react-parser";
import { WP_REST_GET_POST_BASE_URL } from "../config/keys";
import axios from "axios";
import SeoOptimized from "./SeoOptimized";

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  let postIdString = "";
  let mainContent = "";
  let portfolioDetails = {};

  useEffect(() => {
    const getPost = async () => {
      let blogPost;
      let url = WP_REST_GET_POST_BASE_URL + id;
      try {
        const response = await axios.get(url);
        console.log("response data", response.data);
        blogPost = response.data;
        blogPost.excerpt.rendered = blogPost.excerpt.rendered
          .replace(/(^"|"$)/g, "")
          .replace("[", "")
          .replace("]", "");
        setPost(blogPost);
      } catch (err) {
        document.querySelector("#locating-post").innerHTML =
          "<h1>Post Not Found</h1><p>Redirecting to Home Page</p>";

        setTimeout(() => {
          window.location.replace("/");
        }, 3000);
      }
    };

    getPost();

    document.querySelector("#homeLink").classList.remove("active");
  }, []);

  if (post) {
    postIdString = "post-" + post.id;
    const content = post.content.rendered;
    const galleryBeginningIndex = content.indexOf(
      '<figure class="wp-block-image '
    );
    mainContent = content
      .slice(0, galleryBeginningIndex)
      .replace("[", "")
      .replace("]", "");
    const galleryContent = content.slice(galleryBeginningIndex);
    let beginningIndex = 0;
    let startsWithUrl = "";
    let url = "";
    let remainingGallery = galleryContent;
    let images = [];
    let elements = [];

    let portfolioImage = {};
    let portfolioElement = {};
    let morePhotos = true;
    let slideLocation = 0;

    while (morePhotos) {
      if (remainingGallery.indexOf("src=") === -1) {
        morePhotos = false;
        continue;
      }
      beginningIndex = remainingGallery.indexOf("src=") + 5;
      startsWithUrl = remainingGallery.slice(beginningIndex);
      url = startsWithUrl.slice(0, startsWithUrl.indexOf('"'));
      remainingGallery = startsWithUrl.slice(startsWithUrl.indexOf('"'));
      portfolioImage = {
        image: url,
        slideLocation: slideLocation,
      };

      portfolioElement = {
        href: url,
        type: "image",
      };

      images.push(portfolioImage);
      elements.push(portfolioElement);
      slideLocation += 1;
    }

    portfolioDetails.images = images;
    portfolioDetails.elements = elements;

    console.log(portfolioDetails);
  }

  if (!post) {
    return (
      <div
        style={{
          height: "60vh",
          marginTop: 175,
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
        id="locating-post"
      >
        Locating Post
      </div>
    );
  } else {
    return (
      <section id="post" className="post" style={{ minHeight: "100vh" }}>
        <SeoOptimized title="Gallery" />
        <div className="container">
          <div className="row text-center mt-5">
            <h1 className="display-3 fw-bold text-capitalize">
              {post.title.rendered}
            </h1>
            <div className="heading-line"></div>
          </div>
        </div>

        <div className="container post-text" id={postIdString}>
          {parse(mainContent)}
        </div>

        <div className="container portfoio">
          <p className="mobilePresent">
            Tap on any image to display in full screen gallery.
          </p>
          <p className="largePresent">
            Hover over any image to display in full screen gallery.
          </p>
          <PortfolioItems portfolioDetails={portfolioDetails} />
        </div>
      </section>
    );
  }
};

export default PostPage;
