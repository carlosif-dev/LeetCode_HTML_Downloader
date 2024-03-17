// ==UserScript==
// @name         LeetCode Problem Downloader
// @namespace    http://tampermonkey.net/
// @version      2024-03-17
// @description  Download Problem from LeetCode as html file
// @author       Carlos
// @match        https://leetcode.com/problems/*/description/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leetcode.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const titleXPath = '/html/body/div[1]/div[2]/div/div/div[4]/div/div/div[4]/div/div[1]/div[1]/div[1]/div';
    const contentXPath = '/html/body/div[1]/div[2]/div/div/div[4]/div/div/div[4]/div/div[1]/div[3]';

    var titleHTML;
    var contentHTML;

    // Function to check if the target element exists
    function checkTargetElement() {
        return document.evaluate(titleXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue !== null;
    }

    // Function to get HTML content by XPath
    function getContentByXPath(xpath) {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element;
    }

    function removeSpecialCharacters(str) {
        // Replace any non-alphanumeric characters except spaces and hifen with an empty string
        return str.replace(/[^a-zA-Z0-9\s\-]/g, '');
    }

    function saveHTMLToFile(title, content){
        const blob = new Blob([`<h1>${title.innerText}</h1>`, content.innerHTML], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = removeSpecialCharacters(title.innerText) + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function runCode() {
        const bodyElement = document.body;

        let downloadDiv = document.createElement('div');
        downloadDiv.id = 'download_button';
        downloadDiv.className = 'sticky-download-button';
        downloadDiv.innerText = 'Download';
        downloadDiv.style.position = 'fixed';
        downloadDiv.style.bottom = '10px';
        downloadDiv.style.right = '10px';
        downloadDiv.style.backgroundColor = '#333'; // Dark background color
        downloadDiv.style.color = '#fff'; // White text color
        downloadDiv.style.padding = '8px 16px'; // Padding for button
        downloadDiv.style.borderRadius = '4px'; // Rounded corners
        downloadDiv.style.cursor = 'pointer';

        downloadDiv.addEventListener('click', function() {
            titleHTML = getContentByXPath(titleXPath);
            contentHTML = getContentByXPath(contentXPath);

            if (titleHTML && contentHTML) {
                saveHTMLToFile(titleHTML, contentHTML);
            } else {
                console.error('Failed to retrieve title or content HTML.');
            }
        });

        bodyElement.appendChild(downloadDiv);
    }

    // Function to repeatedly check for the target element
    function waitForTargetElement() {
        let timeElapsed = 0;
        const interval = setInterval(function() {
            if (checkTargetElement()) {
                clearInterval(interval);
                runCode();
            } else {
                timeElapsed += 1000;
                if (timeElapsed >= 60000) { // 1 minute timeout
                    clearInterval(interval);
                    console.log("Timeout: Target element not found after 1 minute.");
                }
            }
        }, 1000);
    }

    waitForTargetElement();

})();
