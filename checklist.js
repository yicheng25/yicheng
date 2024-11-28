// 显示当前日期
document.addEventListener('DOMContentLoaded', function() {
    const dateDisplay = document.getElementById('currentDate');
    const today = new Date();
    const dateString = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    dateDisplay.textContent = dateString;
});

// 拍照功能
async function takePhoto(button) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const photoPreview = button.parentElement.querySelector('.photo-preview');
        
        // 创建视频预览
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        
        // 创建拍照按钮
        const captureButton = document.createElement('button');
        captureButton.textContent = '拍照';
        captureButton.className = 'capture-button';
        
        // 创建取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.className = 'cancel-button';
        
        photoPreview.innerHTML = '';
        photoPreview.appendChild(video);
        photoPreview.appendChild(captureButton);
        photoPreview.appendChild(cancelButton);
        
        // 拍照事件
        captureButton.onclick = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            // 保存照片到本地存储
            const photoData = canvas.toDataURL('image/jpeg');
            savePhotoLocally(photoData, button.closest('.checklist-item'));
            
            // 清理视频流
            stream.getTracks().forEach(track => track.stop());
            
            // 显示照片预览
            const img = document.createElement('img');
            img.src = photoData;
            photoPreview.innerHTML = '';
            photoPreview.appendChild(img);
        };
        
        // 取消拍照
        cancelButton.onclick = () => {
            stream.getTracks().forEach(track => track.stop());
            photoPreview.innerHTML = '';
        };
        
    } catch (err) {
        console.error('无法访问摄像头:', err);
        alert('无法访问摄像头，请确保已授予权限。');
    }
}

// 处理文件上传
function handleFileUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        const photoPreview = input.closest('.item-actions').querySelector('.photo-preview');
        
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            photoPreview.innerHTML = '';
            photoPreview.appendChild(img);
            
            // 保存上传的图片
            savePhotoLocally(e.target.result, input.closest('.checklist-item'));
        };
        
        reader.readAsDataURL(file);
    }
}

// 修改保存照片函数
function savePhotoLocally(photoData, listItem) {
    const date = new Date();
    const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const checklistName = document.querySelector('.checklist-title').textContent;
    const itemText = listItem.querySelector('.item-text').textContent;
    
    const key = `checklist_photo_${dateString}_${checklistName}_${itemText}`;
    try {
        localStorage.setItem(key, photoData);
        showToast('照片已保存');
    } catch (e) {
        console.error('保存照片失败:', e);
        showToast('照片保存失败，可能是存储空间不足');
    }
}

// 修改保存检查列表函数
function saveChecklist() {
    const date = new Date();
    const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const checklistName = document.querySelector('.checklist-title').textContent;
    const items = document.querySelectorAll('.checklist-item');
    
    const record = {
        date: dateString,
        name: checklistName,
        items: Array.from(items).map(item => ({
            text: item.querySelector('.item-text').textContent,
            hasPhoto: item.querySelector('.photo-preview img') !== null
        }))
    };
    
    try {
        // 保存记录到本地存储
        const key = `checklist_record_${dateString}_${checklistName}`;
        localStorage.setItem(key, JSON.stringify(record));
        showToast('检查列表记录已保存！');
        
        // 延迟后返回主页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (e) {
        console.error('保存记录失败:', e);
        showToast('保存失败，请重试');
    }
}

// 添加提示函数
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 2秒后移除提示
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 2000);
} 