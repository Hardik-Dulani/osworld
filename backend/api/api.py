from ninja import NinjaAPI

api = NinjaAPI()
print("hello")
@api.get("/status")
def backend_status(request):
    return {"status": "ok", "message": "Osworld backend is live!"}