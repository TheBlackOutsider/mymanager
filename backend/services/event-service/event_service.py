import logging
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from shared.models.event import Event, EventType, EventStatus

logger = logging.getLogger(__name__)

class EventService:
    """Service de gestion des événements avec pattern Singleton"""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EventService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialized = True
    
    def get_all_events(self, db: Session, page: int = 1, limit: int = 10,
                      search: Optional[str] = None, type: Optional[EventType] = None,
                      status: Optional[EventStatus] = None) -> Dict[str, Any]:
        """Récupération de tous les événements avec pagination et filtres"""
        query = db.query(Event)
        
        # Filtres
        if search:
            query = query.filter(Event.title.ilike(f"%{search}%"))
        
        if type:
            query = query.filter(Event.type == type)
        
        if status:
            query = query.filter(Event.status == status)
        
        # Pagination
        total = query.count()
        events = query.offset((page - 1) * limit).limit(limit).all()
        
        # Conversion des attendees JSON
        for event in events:
            if event.attendees:
                try:
                    event.attendees = json.loads(event.attendees)
                except:
                    event.attendees = []
            else:
                event.attendees = []
        
        return {
            "data": events,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    
    def get_event_by_id(self, db: Session, event_id: str) -> Optional[Event]:
        """Récupération d'un événement par ID"""
        event = db.query(Event).filter(Event.id == event_id).first()
        if event and event.attendees:
            try:
                event.attendees = json.loads(event.attendees)
            except:
                event.attendees = []
        return event
    
    def create_event(self, db: Session, event_data: dict) -> Event:
        """Création d'un nouvel événement"""
        # Conversion des attendees en JSON
        if 'attendees' in event_data:
            event_data['attendees'] = json.dumps(event_data['attendees'])
        
        event = Event(**event_data)
        db.add(event)
        db.commit()
        db.refresh(event)
        
        # Conversion back pour la réponse
        if event.attendees:
            event.attendees = json.loads(event.attendees)
        
        return event
    
    def update_event(self, db: Session, event_id: str, update_data: dict) -> Optional[Event]:
        """Mise à jour d'un événement"""
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return None
        
        # Conversion des attendees en JSON si nécessaire
        if 'attendees' in update_data:
            update_data['attendees'] = json.dumps(update_data['attendees'])
        
        for field, value in update_data.items():
            if hasattr(event, field) and value is not None:
                setattr(event, field, value)
        
        db.commit()
        db.refresh(event)
        
        # Conversion back pour la réponse
        if event.attendees:
            event.attendees = json.loads(event.attendees)
        
        return event
    
    def delete_event(self, db: Session, event_id: str) -> bool:
        """Suppression d'un événement"""
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return False
        
        db.delete(event)
        db.commit()
        return True
    
    def get_events_by_type(self, db: Session, event_type: EventType) -> List[Event]:
        """Récupération des événements par type"""
        events = db.query(Event).filter(Event.type == event_type).all()
        for event in events:
            if event.attendees:
                try:
                    event.attendees = json.loads(event.attendees)
                except:
                    event.attendees = []
        return events
    
    def get_events_by_status(self, db: Session, status: EventStatus) -> List[Event]:
        """Récupération des événements par statut"""
        events = db.query(Event).filter(Event.status == status).all()
        for event in events:
            if event.attendees:
                try:
                    event.attendees = json.loads(event.attendees)
                except:
                    event.attendees = []
        return events
    
    def get_upcoming_events(self, db: Session, limit: int = 10) -> List[Event]:
        """Récupération des événements à venir"""
        events = db.query(Event).filter(
            Event.start_date > datetime.utcnow(),
            Event.status == EventStatus.published
        ).order_by(Event.start_date).limit(limit).all()
        
        for event in events:
            if event.attendees:
                try:
                    event.attendees = json.loads(event.attendees)
                except:
                    event.attendees = []
        
        return events
    
    def publish_event(self, db: Session, event_id: str) -> bool:
        """Publication d'un événement"""
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return False
        
        event.status = EventStatus.published
        db.commit()
        return True
    
    def cancel_event(self, db: Session, event_id: str) -> bool:
        """Annulation d'un événement"""
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return False
        
        event.status = EventStatus.cancelled
        db.commit()
        return True
    
    def add_attendee(self, db: Session, event_id: str, employee_id: str) -> bool:
        """Ajout d'un participant à un événement"""
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return False
        
        attendees = []
        if event.attendees:
            try:
                attendees = json.loads(event.attendees)
            except:
                attendees = []
        
        if employee_id not in attendees:
            attendees.append(employee_id)
            event.attendees = json.dumps(attendees)
            db.commit()
            return True
        
        return False
    
    def remove_attendee(self, db: Session, event_id: str, employee_id: str) -> bool:
        """Suppression d'un participant d'un événement"""
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return False
        
        attendees = []
        if event.attendees:
            try:
                attendees = json.loads(event.attendees)
            except:
                attendees = []
        
        if employee_id in attendees:
            attendees.remove(employee_id)
            event.attendees = json.dumps(attendees)
            db.commit()
            return True
        
        return False
