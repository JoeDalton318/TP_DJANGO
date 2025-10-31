import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';

const PhotoGallery = ({ photos, mainImage, attractionName, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  
  // Debug - Afficher les données reçues
  console.log('🖼️ PhotoGallery DEBUG:', {
    attractionName,
    mainImage,
    photosCount: photos ? photos.length : 0,
    photosStructure: photos ? photos.slice(0, 2) : null // Premiers éléments pour debug
  });
  
  // Préparer la liste des images
  const allImages = [];
  
  // Ajouter l'image principale
  if (mainImage) {
    allImages.push({
      url: mainImage,
      caption: attractionName,
      isMain: true
    });
  }
  
  // Ajouter les photos additionnelles
  if (photos && photos.length > 0) {
    photos.forEach((photo, index) => {
      const imageUrl = photo.images?.large?.url || 
                      photo.images?.medium?.url || 
                      photo.images?.small?.url;
      
      if (imageUrl && imageUrl !== mainImage) {
        allImages.push({
          url: imageUrl,
          caption: photo.caption || `Photo ${index + 1}`,
          isMain: false
        });
      }
    });
  }
  
  const totalImages = allImages.length;
  
  if (totalImages === 0) {
    return null;
  }
  
  const openGallery = (index = 0) => {
    setCurrentIndex(index);
    setShowGallery(true);
  };
  
  const closeGallery = () => {
    setShowGallery(false);
  };
  
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };
  
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };
  
  return (
    <>
      {/* Image principale avec indicateur */}
      <div className={`position-relative ${className}`} style={{ cursor: 'pointer' }}>
        <img
          src={allImages[0].url}
          alt={attractionName}
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover' }}
          onClick={() => openGallery(0)}
        />
        
        {/* Indicateur de galerie */}
        {totalImages > 1 && (
          <div className="position-absolute bottom-0 end-0 m-2">
            <button
              className="btn btn-dark btn-sm bg-opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                openGallery(0);
              }}
              title={`Voir les ${totalImages} photos`}
            >
              <Camera size={14} className="me-1" />
              {totalImages}
            </button>
          </div>
        )}
        
        {/* Miniatures si plusieurs images */}
        {totalImages > 1 && (
          <div className="position-absolute bottom-0 start-0 m-2">
            <div className="d-flex">
              {allImages.slice(1, 4).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Miniature ${index + 2}`}
                  className="border border-white me-1"
                  style={{ 
                    width: '30px', 
                    height: '30px', 
                    objectFit: 'cover',
                    cursor: 'pointer',
                    opacity: 0.8
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openGallery(index + 1);
                  }}
                />
              ))}
              {totalImages > 4 && (
                <div
                  className="d-flex align-items-center justify-content-center border border-white text-white"
                  style={{ 
                    width: '30px', 
                    height: '30px', 
                    fontSize: '10px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openGallery(4);
                  }}
                >
                  +{totalImages - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de galerie complète */}
      {showGallery && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999 }}
          onClick={closeGallery}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              
              {/* Header avec compteur et fermeture */}
              <div className="modal-header border-0 text-white">
                <h5 className="modal-title">
                  {attractionName} - Photo {currentIndex + 1} sur {totalImages}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeGallery}
                  aria-label="Fermer"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Image principale */}
              <div className="modal-body p-0 text-center position-relative">
                <img
                  src={allImages[currentIndex].url}
                  alt={allImages[currentIndex].caption}
                  className="img-fluid"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Boutons navigation */}
                {totalImages > 1 && (
                  <>
                    <button
                      className="btn btn-light position-absolute start-0 top-50 translate-middle-y ms-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      style={{ opacity: 0.8 }}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <button
                      className="btn btn-light position-absolute end-0 top-50 translate-middle-y me-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      style={{ opacity: 0.8 }}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
              
              {/* Footer avec caption */}
              <div className="modal-footer border-0 text-white justify-content-center">
                <p className="mb-0">{allImages[currentIndex].caption}</p>
              </div>
              
              {/* Miniatures de navigation */}
              {totalImages > 1 && (
                <div className="d-flex justify-content-center p-3" style={{ flexWrap: 'wrap' }}>
                  {allImages.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Miniature ${index + 1}`}
                      className={`border me-2 mb-2 ${index === currentIndex ? 'border-primary border-3' : 'border-light'}`}
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover',
                        cursor: 'pointer',
                        opacity: index === currentIndex ? 1 : 0.7
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;