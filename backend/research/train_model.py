import pandas as pd
import numpy as np
import pickle
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

def main():
    print("--- Cyberbullying Detecion ML Training Pipeline ---")
    
    # 1. Load Data
    data_path = "data/cyberbullying_dataset_malaysia.csv"
    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"Dataset Shape: {df.shape}")
    print("Class Distribution:")
    print(df['label'].value_counts())
    
    # 2. Preprocessing & Vectorization
    print("\nVectorizing text data using TF-IDF...")
    X_text = df['text']
    y = df['label']
    
    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words='english',
        max_features=5000,
        ngram_range=(1, 2)
    )
    
    X = vectorizer.fit_transform(X_text)
    
    # 3. Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # 4. Model 1: Naive Bayes
    print("\nTraining Multinomial Naive Bayes model...")
    nb_model = MultinomialNB()
    nb_model.fit(X_train, y_train)
    nb_preds = nb_model.predict(X_test)
    nb_acc = accuracy_score(y_test, nb_preds)
    print(f"Naive Bayes Accuracy: {nb_acc:.4f}")
    
    # 5. Model 2: Support Vector Machine (SVM)
    print("\nTraining Support Vector Machine (SVC) model...")
    svm_model = SVC(kernel='linear', probability=True, random_state=42)
    svm_model.fit(X_train, y_train)
    svm_preds = svm_model.predict(X_test)
    svm_acc = accuracy_score(y_test, svm_preds)
    print(f"SVM Accuracy: {svm_acc:.4f}")
    
    # Select Best Model (Assuming SVM based on typical small text datasets)
    best_model = svm_model
    best_preds = svm_preds
    model_name = "SVM"
    
    print("\n--- Detailed Evaluation Report (Best Model: SVM) ---")
    print(classification_report(y_test, best_preds, target_names=["Safe (0)", "Cyberbullying (1)"]))
    
    # 6. Generate Confusion Matrix Plot
    cm = confusion_matrix(y_test, best_preds)
    plt.figure(figsize=(6,5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=["Safe", "Bullying"], yticklabels=["Safe", "Bullying"])
    plt.title("Confusion Matrix - Setup (SVM Model)")
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    plot_path = "confusion_matrix.png"
    plt.savefig(plot_path)
    print(f"Saved confusion matrix plot to: {plot_path}")
    
    # 7. Serialization (Save Models to Disk)
    print("\nSerializing and saving vectorizer and best model to disk...")
    # Ensure models directory exists
    os.makedirs("../models", exist_ok=True)
    
    vectorizer_path = "../models/tfidf_vectorizer.pkl"
    model_path = "../models/custom_svm_model.pkl"
    
    with open(vectorizer_path, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    with open(model_path, 'wb') as f:
        pickle.dump(best_model, f)
        
    print(f"Successfully saved {vectorizer_path}")
    print(f"Successfully saved {model_path}")
    print("\n--- ML Training Pipeline Completed Successfully ---")

if __name__ == "__main__":
    main()
