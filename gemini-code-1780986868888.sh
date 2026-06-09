curl -X POST http://localhost:3000/api/v1/activities \
-H "Content-Type: application/json" \
-d '{
  "category": "transport",
  "subCategory": "medium_gasoline_car",
  "amount": -10.5, 
  "timestamp": "Not-A-Date"
}'