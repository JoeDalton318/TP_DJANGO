import React, { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoGalleryDebug = ({ photos, mainImage, attractionName }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Préparer toutes les images
  const allImages = [];
  
  // Image principale
  if (mainImage) {
    allImages.push({
      url: mainImage,
      caption: `${attractionName} - Image principale`,
      type: 'main'
    });
  }

  // Photos additionnelles
  if (photos && Array.isArray(photos)) {
    photos.forEach((photo, index) => {
      if (photo && photo.images) {
        const url = photo.images.large || photo.images.medium || photo.images.small || photo.images.original;
        if (url && url !== mainImage) {
          allImages.push({
            url: url,
            caption: photo.caption || `Photo ${index + 1}`,
            type: 'additional'
          });
        }
      }
    });
  }

  const totalImages = allImages.length;

  console.log('🖼️ PhotoGalleryDebug:', {
    attractionName,
    mainImage: !!mainImage,
    photosArray: photos,
    photosCount: photos ? photos.length : 0,
    allImagesCount: totalImages,
    allImages: allImages.map(img => ({ url: img.url.substring(0, 50) + '...', caption: img.caption }))
  });

  if (totalImages === 0) {
    return (
      <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
        <span className="text-muted">Aucune image disponible</span>
      </div>
    );
  }

  return (
    <>
      {/* Image principale avec compteur */}
      <div className="position-relative">
        <img
          src={allImages[0].url}
          alt={allImages[0].caption}
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => setShowModal(true)}
        />
        
        {/* Badge avec nombre total de photos */}
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-primary bg-opacity-75">
            <Camera size={12} className="me-1" />
            {totalImages} photo{totalImages > 1 ? 's' : ''}
          </span>
        </div>

        {/* Badge cliquable pour galerie */}
        {totalImages > 1 && (
          <div className="position-absolute bottom-0 end-0 m-2">
            <button 
              className="btn btn-dark btn-sm bg-opacity-75"
              onClick={() => setShowModal(true)}
            >
              <Camera size={14} className="me-1" />
              Voir toutes
            </button>
          </div>
        )}
        
        {/* Miniatures des autres photos */}
        {totalImages > 1 && (
          <div className="position-absolute bottom-0 start-0 m-2 d-flex gap-1">
            {allImages.slice(1, 4).map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.caption}
                className="rounded border border-white"
                style={{ 
                  width: '30px', 
                  height: '30px', 
                  objectFit: 'cover',
                  cursor: 'pointer',
                  opacity: 0.8
                }}
                onClick={() => {
                  setCurrentIndex(index + 1);
                  setShowModal(true);
                }}
              />
            ))}
            {totalImages > 4 && (
              <div 
                className="rounded border border-white bg-dark bg-opacity-50 text-white d-flex align-items-center justify-content-center"
                style={{ 
                  width: '30px', 
                  height: '30px',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
                onClick={() => setShowModal(true)}
              >
                +{totalImages - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal galerie complète */}
      {showModal && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-body p-0 position-relative">
                {/* Bouton fermer */}
                <button
                  className="btn btn-light position-absolute top-0 end-0 m-3"
                  style={{ zIndex: 1050 }}
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>

                {/* Image courante */}
                <div className="text-center">
                  <img
                    src={allImages[currentIndex].url}
                    alt={allImages[currentIndex].caption}
                    className="img-fluid rounded"
                    style={{ maxHeight: '80vh', maxWidth: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Navigation */}
                {totalImages > 1 && (
                  <>
                    <button
                      className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex((currentIndex - 1 + totalImages) % totalImages);
                      }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <button
                      className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex((currentIndex + 1) % totalImages);
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Compteur */}
                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                  <span className="badge bg-dark bg-opacity-75 fs-6">
                    {currentIndex + 1} / {totalImages}
                  </span>
                </div>

                {/* Titre/caption */}
                {allImages[currentIndex].caption && (
                  <div className="position-absolute bottom-0 start-0 end-0 p-3">
                    <div className="bg-dark bg-opacity-75 text-white p-2 rounded text-center">
                      {allImages[currentIndex].caption}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGalleryDebug;