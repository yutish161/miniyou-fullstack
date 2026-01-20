import requests

def fetch_repo_structure(repo_url):
    try:
        owner, repo = repo_url.replace("https://github.com/", "").split("/")[:2]
        api_url = f"https://api.github.com/repos/{owner}/{repo}/contents"

        res = requests.get(api_url)
        data = res.json()

        files = []

        # GitHub sometimes returns dict (error)
        if isinstance(data, dict):
            return ["Repository could not be fetched"]

        # Normal case (list)
        for item in data:
            if isinstance(item, dict):
                files.append(item.get("name", "unknown"))

        return files[:50]  # limit to avoid token overflow

    except Exception as e:
        return [f"Error fetching repo: {str(e)}"]
