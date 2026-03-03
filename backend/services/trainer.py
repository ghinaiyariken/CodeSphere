"""
Enterprise ATS Training Module
Supports synthetic data generation and model fine-tuning frameworks.
"""
import random
from typing import List, Dict, Tuple
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

class ATSTrainer:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)

    def generate_synthetic_data(self, num_samples: int = 100) -> List[InputExample]:
        """
        Generates synthetic pairs of (Resume, JD, Label) for training.
        Label is 0-1 similarity.
        """
        skills_pool = ["Python", "Java", "React", "AWS", "SQL", "Docker", "Kubernetes", "Django", "FastAPI"]
        roles_pool = ["Software Engineer", "Data Scientist", "DevOps Engineer", "Frontend Developer"]
        
        examples = []
        for _ in range(num_samples):
            # Pick a random set of skills
            sample_skills = random.sample(skills_pool, k=random.randint(3, 6))
            jd_skills = random.sample(skills_pool, k=random.randint(3, 6))
            
            role = random.choice(roles_pool)
            
            resume = f"{role} with experience in {', '.join(sample_skills)}. Focused on building scalable systems."
            jd = f"Looking for a {role} skilled in {', '.join(jd_skills)}."
            
            # Calculate a "true" label based on skill overlap
            overlap = len(set(sample_skills).intersection(set(jd_skills)))
            score = overlap / max(len(jd_skills), 1)
            
            examples.append(InputExample(texts=[resume, jd], label=float(score)))
            
        return examples

    def train(self, train_examples: List[InputExample], epochs: int = 1, output_path: str = "fine_tuned_ats_model"):
        """
        Fine-tune the model on the provided or generated data.
        """
        train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
        train_loss = losses.CosineSimilarityLoss(self.model)

        print(f"Starting training for {epochs} epochs...")
        self.model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=epochs,
            warmup_steps=100,
            output_path=output_path
        )
        print(f"Training complete. Model saved to {output_path}")

if __name__ == "__main__":
    # Actually perform a small training run to verify it works
    trainer = ATSTrainer()
    print("Generating synthetic training data...")
    data = trainer.generate_synthetic_data(50)
    print(f"Generated {len(data)} synthetic samples.")
    
    import os
    output_dir = "fine_tuned_ats_model_v1"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    trainer.train(data, epochs=1, output_path=output_dir)
    print(f"Success! Model trained and saved to {output_dir}")
