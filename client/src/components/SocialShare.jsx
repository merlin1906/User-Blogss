
function SocialShare({ title = "Check out this article" }) {
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const shareText = `${title} ${shareUrl}`;

  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.select();

        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!copied) {
          throw new Error("Copy failed");
        }
      }

      alert("Article link copied successfully!");
    } catch {
      alert(
        "Unable to copy link. Please copy it from the address bar."
      );
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title,
        text: title,
        url: shareUrl,
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Sharing failed:", error);
      }
    }
  };

  return (
    <section className="social-share">
      <h3>Share this article</h3>

      <div className="social-share-links">
        <a
          className="share-link linkedin"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share article on LinkedIn"
        >
          LinkedIn
        </a>

        <a
          className="share-link twitter"
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share article on X"
        >
          X
        </a>

        <a
          className="share-link whatsapp"
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share article on WhatsApp"
        >
          WhatsApp
        </a>

        {navigator.share && (
          <button
            className="copy-link-button"
            onClick={nativeShare}
            type="button"
          >
            Share
          </button>
        )}

        <button
          className="copy-link-button"
          onClick={copyLink}
          type="button"
        >
          Copy Link
        </button>
      </div>
    </section>
  );
}

export default SocialShare;
