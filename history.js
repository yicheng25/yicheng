document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});

function loadHistory() {
    const historyList = document.getElementById('historyList');
    const records = getAllRecords();
    
    // 清空现有内容
    historyList.innerHTML = '';
    
    // 添加清除所有按钮
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'history-actions';
    actionsDiv.innerHTML = `
        <button class="clear-all-button" onclick="clearAllRecords()">清除所有记录</button>
    `;
    historyList.appendChild(actionsDiv);
    
    if (records.length === 0) {
        historyList.innerHTML += '<div class="no-records">暂无记录</div>';
        return;
    }
    
    // 按日期降序排序记录
    records.sort((a, b) => b.date.localeCompare(a.date));
    
    records.forEach(record => {
        const recordElement = createRecordElement(record);
        historyList.appendChild(recordElement);
    });
}

function getAllRecords() {
    const records = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('checklist_record_')) {
            try {
                const record = JSON.parse(localStorage.getItem(key));
                records.push(record);
            } catch (e) {
                console.error('解析记录出错:', e);
            }
        }
    }
    return records;
}

function createRecordElement(record) {
    const recordDiv = document.createElement('div');
    recordDiv.className = 'history-item';
    
    const dateStr = `${record.date.slice(0, 4)}年${record.date.slice(4, 6)}月${record.date.slice(6, 8)}日`;
    
    recordDiv.innerHTML = `
        <div class="history-header">
            <div class="history-date">${dateStr}</div>
            <div class="history-name">
                ${record.name}
                <button class="delete-button" onclick="deleteRecord('${record.date}', '${record.name}', event)">删除</button>
            </div>
        </div>
        <div class="history-details">
            <div class="completed-items">
                已完成项目: ${record.items.filter(item => item.hasPhoto).length}/${record.items.length}
            </div>
        </div>
    `;
    
    // 添加点击事件查看详情（排除删除按钮的点击）
    recordDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete-button')) {
            showRecordDetails(record);
        }
    });
    
    return recordDiv;
}

function showRecordDetails(record) {
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'record-details-modal';
    
    const dateStr = `${record.date.slice(0, 4)}年${record.date.slice(4, 6)}月${record.date.slice(6, 8)}日`;
    
    detailsContainer.innerHTML = `
        <div class="modal-content">
            <h2>${dateStr} - ${record.name}</h2>
            <div class="details-list">
                ${record.items.map((item, index) => `
                    <div class="detail-item ${item.hasPhoto ? 'completed' : ''}">
                        <span class="detail-number">${index + 1}</span>
                        <span class="detail-text">${item.text}</span>
                        <span class="detail-status">${item.hasPhoto ? '✓' : '✗'}</span>
                    </div>
                `).join('')}
            </div>
            <button class="close-modal-button">关闭</button>
        </div>
    `;
    
    document.body.appendChild(detailsContainer);
    
    // 添加关闭功能
    detailsContainer.querySelector('.close-modal-button').onclick = () => {
        document.body.removeChild(detailsContainer);
    };
    
    detailsContainer.onclick = (e) => {
        if (e.target === detailsContainer) {
            document.body.removeChild(detailsContainer);
        }
    };
}

function deleteRecord(date, name, event) {
    event.stopPropagation(); // 阻止事件冒泡
    
    if (confirm('确定要删除这条记录吗？')) {
        const key = `checklist_record_${date}_${name}`;
        localStorage.removeItem(key);
        
        // 删除相关的照片
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const photoKey = localStorage.key(i);
            if (photoKey.startsWith(`checklist_photo_${date}_${name}`)) {
                localStorage.removeItem(photoKey);
            }
        }
        
        showToast('记录已删除');
        loadHistory(); // 重新加载历史记录
    }
}

function clearAllRecords() {
    if (confirm('确定要删除所有记录吗？此操作不可恢复。')) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key.startsWith('checklist_')) {
                localStorage.removeItem(key);
            }
        }
        showToast('所有记录已清除');
        loadHistory(); // 重新加载历史记录
    }
}

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