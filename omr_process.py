import cv2
import numpy as np

def process_omr(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # Apply Gaussian blur for noise reduction
    blurred = cv2.GaussianBlur(img, (5, 5), 0)

    # Use adaptive thresholding to highlight marks
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2)

    # Debug: Show the thresholded image
    cv2.imshow("Thresholded Image", thresh)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # Find contours in the thresholded image
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    print(f"Contours found: {len(contours)}")

    results = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        # Filter out small contours that might be noise
        if w > 30 and h > 30:
            results.append((x, y))

    print(f"Detected marks: {len(results)}")

    # Sort the results (by row and column position)
    results = sorted(results, key=lambda x: (x[1], x[0]))  # Sort by y (rows), then by x (columns)

    # Define possible answers (can be more than A, B, C, D depending on the questions)
    answers = ["A", "B", "C", "D"]
    extracted_answers = [answers[i % len(answers)] for i in range(len(results))]

    print(f"Extracted answers: {extracted_answers}")
    return extracted_answers

# Example usage
image_path = "./1.jpg"
answers = process_omr(image_path)

