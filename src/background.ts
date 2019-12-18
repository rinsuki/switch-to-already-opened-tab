var tabFlag: {[key: string]: "newtab"} = {}

chrome.webNavigation.onBeforeNavigate.addListener(details => {
    if (details.frameId !== 0) return
    console.log(details.tabId, "beforeNavigate", details.url)
    if (details.url === "about:newtab") {
        tabFlag[details.tabId.toString()] = "newtab"
        return
    } else if (details.url.startsWith("about:")) {
        delete tabFlag[details.tabId.toString()]
        return
    }
    const candidate = [details.url]
    if (details.url === "https://twitter.com/") candidate.push("https://twitter.com/home")
    chrome.tabs.get(details.tabId, c => {
        if (c.id == null) return
        if (tabFlag[c.id.toString()] !== "newtab") return
        chrome.tabs.query({windowId: c.windowId}, tabs => {
            delete tabFlag[c.id!.toString()]
            for (const tab of tabs) {
                if (!candidate.includes(tab.url!)) continue
                chrome.tabs.update(tab.id!, { active: true })
                chrome.tabs.remove(c.id!)
                break
            }
        })
    })
})