import logging
import re
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class DocumentAnalyzer:
    def __init__(self):
        self.document_cache = {}

    def analyze_document(self, content: str) -> Dict[str, Any]:
        """Main entry point for document analysis"""
        try:
            doc_info = self._initial_document_analysis(content)
            logger.info(f"Document analysis result: {doc_info}")
            return doc_info
        except Exception as e:
            logger.error(f"Error analyzing document: {e}")
            return {"document_type": "unknown", "error": str(e)}

    def _initial_document_analysis(self, content: str) -> Dict[str, Any]:
        """Perform initial document analysis with multi-document type support"""
        try:
            content_lower = content.lower()
            
            # Define document type markers with strong identifiers
            document_markers = {
                "tax_return": {
                    "required": [
                        "form 1040",
                        "department of the treasury",
                        "internal revenue service"
                    ],
                    "supporting": [
                        "tax return",
                        "taxable income",
                        "filing status",
                        "irs",
                        "refund amount"
                    ]
                },
                "contract": {
                    "required": [
                        "agreement",
                        "between",
                        "parties",
                        "hereby"
                    ],
                    "supporting": [
                        "terms and conditions",
                        "witness",
                        "whereas",
                        "obligations",
                        "signed and delivered"
                    ]
                },
                "court_filing": {
                    "required": [
                        "court",
                        "case no",
                        "plaintiff",
                        "defendant"
                    ],
                    "supporting": [
                        "jurisdiction",
                        "complaint",
                        "motion",
                        "hearing",
                        "relief"
                    ]
                },
                "legal_notice": {
                    "required": [
                        "notice",
                        "hereby given",
                        "legal"
                    ],
                    "supporting": [
                        "pursuant to",
                        "accordance with",
                        "requirement",
                        "deadline"
                    ]
                }
            }

            # Score each document type
            doc_scores = {}
            for doc_type, markers in document_markers.items():
                score = 0
                # Check required markers (must have at least one)
                has_required = any(marker in content_lower for marker in markers["required"])
                if has_required:
                    score += 10
                    # Add points for supporting markers
                    score += sum(2 for marker in markers["supporting"] 
                               if marker in content_lower)
                doc_scores[doc_type] = score

            logger.info(f"Document type scores: {doc_scores}")

            # Get the highest scoring document type
            best_match = max(doc_scores.items(), key=lambda x: x[1])
            if best_match[1] == 0:
                return {
                    "document_type": "unknown",
                    "confidence": 0,
                    "error": "Could not definitively identify document type"
                }

            # Process based on identified type
            doc_type = best_match[0]
            if doc_type == "tax_return":
                return self._analyze_tax_return(content)
            elif doc_type == "contract":
                return self._analyze_contract(content)
            elif doc_type == "court_filing":
                return self._analyze_court_filing(content)
            elif doc_type == "legal_notice":
                return self._analyze_legal_notice(content)

        except Exception as e:
            logger.error(f"Error in initial document analysis: {e}")
            return {"document_type": "unknown", "error": str(e)}

    def _analyze_tax_return(self, content: str) -> Dict[str, Any]:
        """Analyze tax return documents"""
        return {
            "document_type": "tax_return",
            "form_type": self._extract_field(content, "form", "1040"),
            "tax_year": self._extract_field(content, "tax year", "2023"),
            "key_amounts": {
                "gross_income": self._extract_amount(content, "gross income"),
                "adjusted_gross_income": self._extract_amount(content, "adjusted gross income"),
                "taxable_income": self._extract_amount(content, "taxable income"),
                "refund_amount": self._extract_amount(content, "refund")
            },
            "filing_info": {
                "status": self._extract_field(content, "filing status"),
                "deadline": self._extract_field(content, "deadline")
            }
        }

    def _analyze_contract(self, content: str) -> Dict[str, Any]:
        """Analyze contract documents"""
        return {
            "document_type": "contract",
            "parties": self._extract_parties(content),
            "effective_date": self._extract_date(content, ["effective date", "agreement date"]),
            "term": self._extract_section(content, ["term", "duration", "period"]),
            "key_sections": self._extract_sections(content),
            "execution": {
                "signatories": self._extract_signatories(content),
                "date": self._extract_date(content, ["executed", "signed"])
            }
        }

    def _analyze_court_filing(self, content: str) -> Dict[str, Any]:
        """Analyze court filing documents"""
        return {
            "document_type": "court_filing",
            "case_info": {
                "number": self._extract_case_number(content),
                "court": self._extract_court_name(content),
                "filing_date": self._extract_date(content, ["filed", "date"])
            },
            "parties": {
                "plaintiff": self._extract_party(content, "plaintiff"),
                "defendant": self._extract_party(content, "defendant")
            },
            "nature": self._extract_field(content, "nature of action"),
            "relief": self._extract_field(content, "relief sought")
        }

    def _analyze_legal_notice(self, content: str) -> Dict[str, Any]:
        """Analyze legal notice documents"""
        return {
            "document_type": "legal_notice",
            "notice_type": self._extract_field(content, "notice type"),
            "effective_date": self._extract_date(content, ["effective", "date"]),
            "issuer": self._extract_field(content, "issued by"),
            "key_dates": self._extract_dates(content),
            "requirements": self._extract_requirements(content)
        }

    # Helper methods for field extraction
    def _extract_field(self, content: str, field_label: str, default_value: str = "") -> str:
        try:
            content_lines = content.split('\n')
            for i, line in enumerate(content_lines):
                if field_label.lower() in line.lower():
                    value = line.split(':')[-1].strip()
                    if not value and i + 1 < len(content_lines):
                        value = content_lines[i + 1].strip()
                    return value if value else default_value
            return default_value
        except Exception as e:
            logger.error(f"Error extracting field {field_label}: {e}")
            return default_value

    def _extract_amount(self, content: str, label: str, prefix: str = "$") -> Optional[str]:
        try:
            content_lines = content.lower().split('\n')
            for i, line in enumerate(content_lines):
                if label.lower() in line:
                    for check_line in content_lines[i:i+3]:
                        amounts = re.findall(rf'\{prefix}?\s*\d+(?:,\d{3})*(?:\.\d{2})?', check_line)
                        if amounts:
                            return amounts[0] if amounts[0].startswith('$') else f'${amounts[0]}'
            return None
        except Exception as e:
            logger.error(f"Error extracting amount for {label}: {e}")
            return None

    def _extract_date(self, content: str, date_labels: List[str]) -> Optional[str]:
        try:
            for label in date_labels:
                date = self._extract_field(content, label)
                if date:
                    return date
            return None
        except Exception as e:
            logger.error(f"Error extracting date: {e}")
            return None

    def _extract_sections(self, content: str) -> List[Dict[str, str]]:
        sections = []
        lines = content.split('\n')
        current_section = None
        current_content = []

        for line in lines:
            if self._is_section_header(line):
                if current_section:
                    sections.append({
                        "title": current_section,
                        "content": '\n'.join(current_content).strip()
                    })
                current_section = line.strip()
                current_content = []
            elif current_section:
                current_content.append(line)

        if current_section:
            sections.append({
                "title": current_section,
                "content": '\n'.join(current_content).strip()
            })

        return sections

    def _is_section_header(self, line: str) -> bool:
        patterns = [
            r'^\d+\.\s+[A-Z]',
            r'^[A-Z][A-Z\s]+:',
            r'^[IVXLC]+\.'
        ]
        return any(re.match(pattern, line.strip()) for pattern in patterns)

    def _extract_parties(self, content: str) -> List[str]:
        parties = []
        party_markers = ["between", "and", "party of the first part", "party of the second part"]
        try:
            for marker in party_markers:
                result = self._extract_field(content, marker)
                if result:
                    parties.append(result)
            return parties
        except Exception as e:
            logger.error(f"Error extracting parties: {e}")
            return []

    def _extract_requirements(self, content: str) -> List[str]:
        requirements = []
        requirement_markers = ["must", "shall", "required to", "requirement"]
        try:
            lines = content.split('\n')
            for line in lines:
                if any(marker in line.lower() for marker in requirement_markers):
                    requirements.append(line.strip())
            return requirements
        except Exception as e:
            logger.error(f"Error extracting requirements: {e}")
            return []