from fastapi import FastAPI


app = FastAPI(title="AI Resume Analyzer API")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "AI Resume Analyzer backend is running"}
