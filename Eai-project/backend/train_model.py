import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
import joblib
import os

# 1. Simple Example Dataset (Replace with your actual data)
data = {
    'symptoms': [
        'fever and cough',
        'headache and fatigue',
        'stomach pain',
        'sore throat and fever',
        'general weakness',
        'cough and cold',
        'severe headache'
    ],
    'doctor': [
        'Dr. Ravi - General Physician',
        'Dr. Priya - Specialist',
        'Dr. Priya - Specialist',
        'Dr. Ravi - General Physician',
        'Dr. Priya - Specialist',
        'Dr. Ravi - General Physician',
        'Dr. Priya - Specialist'
    ]
}

df = pd.DataFrame(data)

# 2. Feature Extraction (Converting symptoms to numerical features)
# We'll use CountVectorizer as a simple example.
# For a real application, you might need more sophisticated text processing.
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(df['symptoms'])
y = df['doctor']

# 3. Train the Random Forest Model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# 4. Save the trained model and the vectorizer
# We need to save the vectorizer too, to transform new symptoms for prediction later
model_dir = 'backend'
if not os.path.exists(model_dir):
    os.makedirs(model_dir)

model_path = os.path.join(model_dir, 'random_forest_model.pkl')
vectorizer_path = os.path.join(model_dir, 'count_vectorizer.pkl')

joblib.dump(model, model_path)
joblib.dump(vectorizer, vectorizer_path)

print(f"Model saved to {model_path}")
print(f"Vectorizer saved to {vectorizer_path}")

# Optional: Test the saved model (remove in final script if not needed)
# loaded_model = joblib.load(model_path)
# loaded_vectorizer = joblib.load(vectorizer_path)
# test_symptoms = ['I have a cough']
# test_features = loaded_vectorizer.transform(test_symptoms)
# prediction = loaded_model.predict(test_features)
# print(f"Test prediction for '{test_symptoms[0]}': {prediction[0]}") 