const cornerLinks = document.querySelectorAll('nav.corners li');
const contentBox = document.getElementById('content-box');

let currentCorner = null;
let currentTopicDiv = null;
let CurrentTopicLink = null;

cornerLinks.forEach(link => {
    link.addEventListener('click', async () => {
        const cornerName = link.dataset.corner;
        const topicsJsonPath = `content/${cornerName}/topics.json`;

        try {
            const res = await fetch(topicsJsonPath);
            if (!res.ok) throw new Error('Topics not found');
            const topics = await res.json();

            // Clear content box
            contentBox.innerHTML = '';

            // Track current corner
            currentCorner = cornerName;

            topics.forEach(topic => {
                const topicLink = document.createElement('a');
                topicLink.href = "#";
                topicLink.textContent = topic.title;
                topicLink.classList.add('topic-link');


                topicLink.addEventListener('click', async (e) => {
                    e.preventDefault();

                    // If clicking the same topic again, hide content
                    if (currentTopicDiv && currentTopicDiv.dataset.topic === topic.title) {
                        topicLink.classList.remove('topic-link-selected')
                        currentTopicDiv.remove();
                        currentTopicDiv = null;
                        return;
                    }

                    if (CurrentTopicLink) CurrentTopicLink.classList.remove('topic-link-selected');
                    // Remove previous topic content if exists
                    if (currentTopicDiv) currentTopicDiv.remove();

                    // Fetch new topic content
                    try {
                        const topicRes = await fetch(`content/${cornerName}/${topic.file}`);
                        const html = await topicRes.text();
                        const div = document.createElement('div');
                        div.innerHTML = html;
                        div.dataset.topic = topic.title;
                        div.style.marginTop = "10px";
                        contentBox.appendChild(div);
                        currentTopicDiv = div;
                        CurrentTopicLink = topicLink;
                        CurrentTopicLink.classList.add('topic-link-selected');
                    } catch (err) {
                        console.error(err);
                    }
                });

                contentBox.appendChild(topicLink);
            });

        } catch (err) {
            contentBox.innerHTML = `<p style="color:red;">Failed to load topics for ${cornerName.replace(/_/g, ' ')}.</p>`;
            console.error(err);
        }
    });
});
