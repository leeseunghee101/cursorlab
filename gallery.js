// 갤러리 요소
const galleryList = document.getElementById("galleryList");
const drawButton = document.getElementById("drawButton");

// 그림 그리기 버튼 클릭
drawButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

// 갤러리 업데이트 함수
function updateGallery() {
    galleryList.innerHTML = "";
    
    try {
        const savedArtworks = localStorage.getItem("publishedArtworks");
        if (savedArtworks) {
            const artworks = JSON.parse(savedArtworks);
            
            if (artworks.length === 0) {
                galleryList.innerHTML = "<p class='no-artworks'>아직 게시된 작품이 없습니다.</p>";
                return;
            }

            artworks.forEach((artwork, index) => {
                const artworkElement = document.createElement("div");
                artworkElement.className = "artwork-item";
                
                artworkElement.innerHTML = `
                    <div class="artwork-preview">
                        <img src="${artwork.preview}" alt="Pixel Art Preview">
                    </div>
                    <div class="artwork-info">
                        <h3>${artwork.title || '제목 없음'}</h3>
                        <p class="artwork-content">${artwork.content || ''}</p>
                        <p class="artwork-author">작성자: ${artwork.nickname}</p>
                        <p class="artwork-date">작성일: ${new Date(artwork.date).toLocaleString()}</p>
                    </div>
                    <div class="artwork-actions">
                        <button onclick="editArtwork(${index})">수정하기</button>
                        <button onclick="deleteArtwork(${index})">삭제</button>
                    </div>
                `;
                
                galleryList.appendChild(artworkElement);
            });
        } else {
            galleryList.innerHTML = "<p class='no-artworks'>아직 게시된 작품이 없습니다.</p>";
        }
    } catch (error) {
        console.error("갤러리 업데이트 중 오류 발생:", error);
        galleryList.innerHTML = "<p class='error'>갤러리를 불러오는 중 오류가 발생했습니다.</p>";
    }
}

// 작품 수정
function editArtwork(index) {
    const password = prompt("비밀번호를 입력하세요:");
    if (!password) return;

    try {
        const savedArtworks = localStorage.getItem("publishedArtworks");
        if (savedArtworks) {
            const artworks = JSON.parse(savedArtworks);
            const artwork = artworks[index];
            
            if (artwork.password === password) {
                // 수정할 작품 정보를 localStorage에 저장
                localStorage.setItem("editingArtwork", JSON.stringify({
                    index: index,
                    artwork: artwork
                }));
                
                // 메인 페이지로 이동
                window.location.href = "index.html?mode=edit";
            } else {
                alert("비밀번호가 일치하지 않습니다.");
            }
        }
    } catch (error) {
        console.error("작품 수정 중 오류 발생:", error);
        alert("작품 수정 중 오류가 발생했습니다.");
    }
}

// 작품 삭제
function deleteArtwork(index) {
    const password = prompt("비밀번호를 입력하세요:");
    if (!password) return;

    try {
        const savedArtworks = localStorage.getItem("publishedArtworks");
        if (savedArtworks) {
            const artworks = JSON.parse(savedArtworks);
            const artwork = artworks[index];
            
            if (artwork.password === password) {
                artworks.splice(index, 1);
                localStorage.setItem("publishedArtworks", JSON.stringify(artworks));
                updateGallery();
                alert("작품이 삭제되었습니다.");
            } else {
                alert("비밀번호가 일치하지 않습니다.");
            }
        }
    } catch (error) {
        console.error("작품 삭제 중 오류 발생:", error);
        alert("작품 삭제 중 오류가 발생했습니다.");
    }
}

// 페이지 로드 시 갤러리 업데이트
document.addEventListener("DOMContentLoaded", updateGallery); 