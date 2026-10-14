const copyButton=document.querySelector('.rc-copy');
copyButton?.addEventListener('click',async()=>{const result=document.querySelector('.rc-copy-result');try{await navigator.clipboard.writeText(copyButton.dataset.copyUrl);result.textContent='Link copied.';}catch{result.textContent=copyButton.dataset.copyUrl;}});
